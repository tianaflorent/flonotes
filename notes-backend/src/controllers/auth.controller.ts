import { IncomingMessage, ServerResponse } from "http";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { pool } from "../config/db";
import { send } from "../utils/response";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Erreur 1 corrigée : expiresIn typé correctement ──────────────────────────
const generateToken = (userId: number): string => {
  const secret = process.env.JWT_SECRET as string;
  const options: SignOptions = {
    expiresIn: "7d",
  };
  return jwt.sign({ userId }, secret, options);
};

export const register = async (
  req: IncomingMessage,
  res: ServerResponse,
  body: any
) => {
  const { email, password, name } = body;
  if (!email || !password)
    return send(res, 400, { message: "Email et mot de passe requis" });

  try {
    const [rows] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    ) as any;
    if (rows.length > 0)
      return send(res, 409, { message: "Email déjà utilisé" });

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
      [email, hash, name || ""]
    ) as any;

    const token = generateToken(result.insertId);
    return send(res, 201, {
      token,
      user: { id: result.insertId, email, name: name || "" },
    });
  } catch {
    return send(res, 500, { message: "Erreur serveur" });
  }
};

export const login = async (
  req: IncomingMessage,
  res: ServerResponse,
  body: any
) => {
  const { email, password } = body;
  if (!email || !password)
    return send(res, 400, { message: "Email et mot de passe requis" });

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    ) as any;
    if (rows.length === 0)
      return send(res, 401, { message: "Identifiants incorrects" });

    const user = rows[0];
    if (!user.password)
      return send(res, 401, { message: "Compte Google, utilisez Google Sign-In" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return send(res, 401, { message: "Identifiants incorrects" });

    const token = generateToken(user.id);
    return send(res, 200, {
      token,
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar },
    });
  } catch {
    return send(res, 500, { message: "Erreur serveur" });
  }
};

export const googleAuth = async (
  req: IncomingMessage,
  res: ServerResponse,
  body: any
) => {
  const { idToken } = body;
  if (!idToken)
    return send(res, 400, { message: "Token Google manquant" });

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID as string, // ── Erreur 2 corrigée
    });
    const payload = ticket.getPayload();
    if (!payload)
      return send(res, 401, { message: "Token Google invalide" });

    const { sub: googleId, email, name, picture } = payload;

    // ── Erreurs 3 & 4 corrigées : valeurs garanties non-undefined ────────────
    const safeEmail    = email    ?? "";
    const safeName     = name     ?? "";
    const safePicture  = picture  ?? "";
    const safeGoogleId = googleId ?? "";

    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE google_id = ? OR email = ?",
      [safeGoogleId, safeEmail]
    ) as any;

    let userId: number;

    if (rows.length > 0) {
      userId = rows[0].id;
      await pool.execute(
        "UPDATE users SET google_id = ?, avatar = ?, name = ? WHERE id = ?",
        [safeGoogleId, safePicture, safeName, userId]
      );
    } else {
      const [result] = await pool.execute(
        "INSERT INTO users (email, google_id, name, avatar) VALUES (?, ?, ?, ?)",
        [safeEmail, safeGoogleId, safeName, safePicture]
      ) as any;
      userId = result.insertId;
    }

    const token = generateToken(userId);
    return send(res, 200, {
      token,
      user: { id: userId, email: safeEmail, name: safeName, avatar: safePicture },
    });
  } catch {
    return send(res, 500, { message: "Erreur Google Auth" });
  }
};

export const me = async (
  req: IncomingMessage,
  res: ServerResponse,
  userId: number
) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, email, name, avatar, created_at FROM users WHERE id = ?",
      [userId]
    ) as any;
    if (rows.length === 0)
      return send(res, 404, { message: "Utilisateur introuvable" });
    return send(res, 200, { user: rows[0] });
  } catch {
    return send(res, 500, { message: "Erreur serveur" });
  }
};