import { Router, type Request, type Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { ReportService } from "../service/report.service.js";

export const reportRouter = Router();
const reportService: Readonly<ReportService> = new ReportService();

reportRouter.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {}),
);
