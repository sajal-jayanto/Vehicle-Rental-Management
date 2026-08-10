import express from "express";

import cors from "cors";
import helmet from "helmet";

import { errorHandler } from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/requestLogger.middleware.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";

const app = express();

const bootstrap = () => {
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default bootstrap;
