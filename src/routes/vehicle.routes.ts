import { Router, type Request, type Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";

export const vehicleRouter = Router();

vehicleRouter.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {}),
);
