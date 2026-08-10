import knex from "knex";
import dbConfig from "./knex-config.js";

const db = knex(dbConfig);
const initDatabase = async () => await db.raw("SELECT 1");

export { db, initDatabase };
