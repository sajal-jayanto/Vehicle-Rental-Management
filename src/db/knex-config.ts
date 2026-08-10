import "dotenv/config";
import type { Knex } from "knex";
import { env } from "../config/env.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig: Knex.Config = {
  client: "pg",
  connection: {
    host: env.PG_DB_HOST,
    port: env.PG_DB_PORT,
    user: env.PG_DB_USER_NAME,
    password: env.PG_DB_PASSWORD,
    database: env.PG_DB_NAME,
  },
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
  },
  migrations: {
    directory: path.join(__dirname, "migrations"),
    extension: "ts",
  },
};

export default dbConfig;
