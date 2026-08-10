import { Router, type Request, type Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { VehicleService } from "../service/vehicle.service.js";

export const vehicleRouter = Router();
const vehicleService: Readonly<VehicleService> = new VehicleService();

vehicleRouter.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {}),
);
