import express from "express";

import path from "path";
import cors from "cors";
import helmet from "helmet";

import { errorHandler } from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";

import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { vehicleRouter } from "./routes/vehicle.routes.js";
import { rentalRouter } from "./routes/rental.routes.js";
import { reportRouter } from "./routes/report.routes.js";

const app = express();

const bootstrap = () => {
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  app.use("/uploads", express.static(path.resolve("uploads")));

  app.use("/health", healthRouter);

  const v1Router = express.Router();
  app.use("/api/v1", v1Router);

  v1Router.use("/auth", authRouter);
  v1Router.use("/vehicle", vehicleRouter);
  v1Router.use("/rental", rentalRouter);
  v1Router.use("/report", reportRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default bootstrap;
