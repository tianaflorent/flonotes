import http from "http";
import dotenv from "dotenv";
import { initDB } from "./config/db";
import { handleAuth } from "./routes/auth.routes";
import { handleNotes } from "./routes/notes.routes";
dotenv.config();

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  let body = "";
  req.on("data", chunk => { body += chunk.toString(); });
  req.on("end", async () => {
    const parsedBody = body ? JSON.parse(body) : {};
    const url = req.url || "/";

    try {
      if (url.startsWith("/auth"))
        return await handleAuth(req, res, url, parsedBody);
      if (url.startsWith("/notes"))
        return await handleNotes(req, res, url, parsedBody);

      res.writeHead(404);
      res.end(JSON.stringify({ message: "Route introuvable" }));
    } catch {
      res.writeHead(500);
      res.end(JSON.stringify({ message: "Erreur serveur" }));
    }
  });
});

const PORT = process.env.PORT || 3000;

initDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
  });
});