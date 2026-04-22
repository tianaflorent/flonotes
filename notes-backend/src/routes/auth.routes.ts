import { IncomingMessage, ServerResponse } from "http";
import { send } from "../utils/response";
import { register, login, googleAuth, me } from "../controllers/auth.controller";
import { getUserIdFromToken } from "../utils/auth.utils";

export const handleAuth = async (
  req: IncomingMessage,
  res: ServerResponse,
  url: string,
  body: any
) => {
  if (url === "/auth/register" && req.method === "POST")
    return await register(req, res, body);

  if (url === "/auth/login" && req.method === "POST")
    return await login(req, res, body);

  if (url === "/auth/google" && req.method === "POST")
    return await googleAuth(req, res, body);

  if (url === "/auth/me" && req.method === "GET") {
    const userId = getUserIdFromToken(req);
    if (!userId) return send(res, 401, { message: "Non autorisé" });
    return await me(req, res, userId);
  }

  return send(res, 404, { message: "Route auth introuvable" });
};