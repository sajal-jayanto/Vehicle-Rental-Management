import bootstrap from "./app.js";
import { env } from "./config/env.js";
import { db, initDatabase } from "./db/knex.js";
import { logger } from "./utils/logger.js";

const app = bootstrap();
const PORT = Number(env.port) || 3000;

const startServer = async () => {
  try {
    // ======================= Database Connection And Start Server ===================
    await initDatabase();
    console.log("✅ Connected to database successfully.");
    app.listen(PORT, () => {
      logger.info(`✅ Service listening on port ${PORT} [${env.nodeEnv}]`);
    });
  } catch (err) {
    // ======================= Database Connection Or Project Start Error ===================
    console.error("❌ Failed to connect to database, aborting startup");
    console.error(err);
    await db.destroy();
    process.exit(1);
  }
};

startServer();
