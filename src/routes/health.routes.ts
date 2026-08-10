import { Router, type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";

import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { initDatabase } from "../db/knex.js";

export const healthRouter = Router();

healthRouter.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    let statusCode = StatusCodes.OK;
    let status = "ok";
    let databaseStatus = "ok";

    try {
      await initDatabase();
    } catch {
      statusCode = StatusCodes.SERVICE_UNAVAILABLE;
      status = "error";
      databaseStatus = "error";
    }

    const response = {
      status,
      time: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: databaseStatus,
      },
    };

    res.status(statusCode).json(response);
  }),
);
