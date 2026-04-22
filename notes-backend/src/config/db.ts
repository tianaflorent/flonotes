import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export const initDB = async () => {
  const conn = await pool.getConnection();

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      email      VARCHAR(191) UNIQUE NOT NULL,
      password   VARCHAR(255),
      google_id  VARCHAR(191),
      name       VARCHAR(255),
      avatar     VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS notes (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      user_id    INT NOT NULL,
      title      VARCHAR(500) NOT NULL DEFAULT 'Sans titre',
      content    TEXT,
      format     JSON,
      trashed    TINYINT(1) DEFAULT 0,
      archived   TINYINT(1) DEFAULT 0,
      favorite   TINYINT(1) DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  conn.release();
  console.log("Base de données initialisée");
};