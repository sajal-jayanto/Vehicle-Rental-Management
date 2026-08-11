import { Router, type Request, type Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { RentalService } from "../service/rental.service.js";
import { validateSchema } from "../middlewares/validate.middleware.js";
import {
  createRentalSchema,
  getRentalsSchema,
  getReportByIdSchema,
} from "../schemas/rental.schema.js";
import { StatusCodes } from "http-status-codes";

export const rentalRouter = Router();
const rentalService: Readonly<RentalService> = new RentalService();

rentalRouter.get(
  "/",
  validateSchema({ query: getRentalsSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const vehicle_id = String(req.query.vehicle_id ?? "");
    const status = String(req.query.status ?? "");
    const start_date = req.query.start_date ?? undefined;
    const end_date = req.query.end_date ?? undefined;

    const rentals = await rentalService.findAll({
      page,
      limit,
      vehicle_id,
      status,
      start_date,
      end_date,
    });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      data: rentals,
    });
  }),
);

rentalRouter.get(
  "/:id",
  validateSchema({ params: getReportByIdSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const rental = await rentalService.findOne({ id });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      data: rental,
    });
  }),
);

rentalRouter.post(
  "/",
  validateSchema({ body: createRentalSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { vehicle_id, customer_name, customer_phone, start_date, end_date } = req.body;

    const rentalInfo = await rentalService.createVehicleRental({
      vehicle_id,
      customer_name,
      customer_phone,
      start_date,
      end_date,
    });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.CREATED,
      message: "Vehicle rented successful",
      data: rentalInfo,
    });
  }),
);

rentalRouter.put(
  "/:id",
  validateSchema({ params: getReportByIdSchema, body: createRentalSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { vehicle_id, customer_name, customer_phone, start_date, end_date, status } = req.body;

    const updatedRental = rentalService.editRental({
      id,
      vehicle_id,
      customer_name,
      customer_phone,
      start_date,
      end_date,
      status,
    });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.CREATED,
      message: "Rental updated successfully",
      data: updatedRental,
    });
  }),
);

rentalRouter.delete(
  "/:id",
  validateSchema({ params: getReportByIdSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    await rentalService.deleteRental({ id });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Rental record deleted successfully",
    });
  }),
);
