import { ServerResponse } from "http";
import { pool } from "../config/db";
import { send } from "../utils/response";

export const getNotes = async (res: ServerResponse, userId: number) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC",
      [userId]
    ) as any;
    return send(res, 200, { notes: rows });
  } catch {
    return send(res, 500, { message: "Erreur serveur" });
  }
};

export const createNote = async (
  res: ServerResponse,
  userId: number,
  body: any
) => {
  try {
    const { title, content, format } = body;
    const formatJson = format ? JSON.stringify(format) : null;

    const [result] = await pool.execute(
      "INSERT INTO notes (user_id, title, content, format) VALUES (?, ?, ?, ?)",
      [userId, title || "Sans titre", content || "", formatJson]
    ) as any;

    const [rows] = await pool.execute(
      "SELECT * FROM notes WHERE id = ?", [result.insertId]
    ) as any;

    return send(res, 201, { note: rows[0] });
  } catch {
    return send(res, 500, { message: "Erreur serveur" });
  }
};

export const updateNote = async (
  res: ServerResponse,
  userId: number,
  id: number,
  body: any
) => {
  try {
    const { title, content, format, trashed, archived, favorite } = body;

    const fields: string[] = [];
    const values: any[]    = [];

    if (title    !== undefined) { fields.push("title = ?");    values.push(title);    }
    if (content  !== undefined) { fields.push("content = ?");  values.push(content);  }
    if (format   !== undefined) { fields.push("format = ?");   values.push(JSON.stringify(format)); }
    if (trashed  !== undefined) { fields.push("trashed = ?");  values.push(trashed  ? 1 : 0); }
    if (archived !== undefined) { fields.push("archived = ?"); values.push(archived ? 1 : 0); }
    if (favorite !== undefined) { fields.push("favorite = ?"); values.push(favorite ? 1 : 0); }

    if (fields.length === 0)
      return send(res, 400, { message: "Aucun champ à mettre à jour" });

    values.push(id, userId);

    await pool.execute(
      `UPDATE notes SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
      values
    );

    const [rows] = await pool.execute(
      "SELECT * FROM notes WHERE id = ? AND user_id = ?",
      [id, userId]
    ) as any;

    return send(res, 200, { note: rows[0] });
  } catch {
    return send(res, 500, { message: "Erreur serveur" });
  }
};

export const deleteNote = async (
  res: ServerResponse,
  userId: number,
  id: number
) => {
  try {
    await pool.execute(
      "DELETE FROM notes WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    return send(res, 200, { message: "Note supprimée" });
  } catch {
    return send(res, 500, { message: "Erreur serveur" });
  }
};