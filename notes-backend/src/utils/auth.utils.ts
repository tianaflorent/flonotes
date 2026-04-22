import { IncomingMessage } from "http";
import jwt from "jsonwebtoken";

export const getUserIdFromToken = (req: IncomingMessage): number | null => {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) return null;

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
};