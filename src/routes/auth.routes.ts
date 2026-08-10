import { Router, type Request, type Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";

export const authRouter = Router();

authRouter.get(
  "/login",
  asyncHandler(async (_req: Request, res: Response) => {}),
);
