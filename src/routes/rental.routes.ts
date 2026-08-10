import { Router, type Request, type Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { RentalService } from "../service/rental.service.js";

export const rentalRouter = Router();
const rentalService: Readonly<RentalService> = new RentalService();

rentalRouter.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {}),
);
