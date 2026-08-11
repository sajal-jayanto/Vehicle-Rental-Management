import { Router, type Request, type Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { ReportService } from "../service/report.service.js";
import { validateSchema } from "../middlewares/validate.middleware.js";
import { getReportSchema } from "../schemas/report.schema.js";
import { StatusCodes } from "http-status-codes";

export const reportRouter = Router();
const reportService: Readonly<ReportService> = new ReportService();

reportRouter.get(
  "/rentals",
  validateSchema({ query: getReportSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { month, vehicle_id } = req.query;

    const report = await reportService.generateReport({
      month: month as string | undefined,
      vehicle_id: vehicle_id as string | undefined,
    });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Report generated successfully",
      data: report,
    });
  })
);
