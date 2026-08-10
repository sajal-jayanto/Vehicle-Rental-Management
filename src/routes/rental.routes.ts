import { Router, type Request, type Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";

export const rentalRouter = Router();

rentalRouter.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {}),
);
