import { IncomingMessage, ServerResponse } from "http";
import { send } from "../utils/response";
import { getNotes, createNote, updateNote, deleteNote } from "../controllers/notes.controller";
import { getUserIdFromToken } from "../utils/auth.utils";

export const handleNotes = async (
  req: IncomingMessage,
  res: ServerResponse,
  url: string,
  body: any
) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return send(res, 401, { message: "Non autorisé" });

  if (url === "/notes" && req.method === "GET")
    return await getNotes(res, userId);

  if (url === "/notes" && req.method === "POST")
    return await createNote(res, userId, body);

  const matchId = url.match(/^\/notes\/(\d+)$/);
  if (matchId && req.method === "PUT")
    return await updateNote(res, userId, parseInt(matchId[1]), body);

  if (matchId && req.method === "DELETE")
    return await deleteNote(res, userId, parseInt(matchId[1]));

  return send(res, 404, { message: "Route notes introuvable" });
};