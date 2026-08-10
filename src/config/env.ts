import "dotenv/config";

export const env = {
  // ================= app config ========================= //
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",

  // ========================== DB config ==================== //
  PG_DB_HOST: process.env.DB_HOST ?? "localhost",
  PG_DB_PORT: Number(process.env.DB_PORT ?? 5432),
  PG_DB_USER_NAME: process.env.DB_USER_NAME ?? "root",
  PG_DB_PASSWORD: process.env.DB_PASSWORD ?? "root",
  PG_DB_NAME: process.env.DB_NAME ?? "vehicle_rent",

  // ========================== JWT config ==================== //
  JWT_SECRET: process.env.JWT_SECRET ?? "",
};
