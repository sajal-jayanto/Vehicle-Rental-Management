import { Router, type Request, type Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { VehicleService } from "../service/vehicle.service.js";
import { vehiclePhotoUpload } from "../middlewares/upload.middleware.js";
import { StatusCodes } from "http-status-codes";
import { validateSchema } from "../middlewares/validate.middleware.js";
import {
  createVehicleSchema,
  deleteVehicleSchema,
  editVehicleSchema,
  getVehicleByIdSchema,
  getVehiclesSchema,
} from "../schemas/vehicle.schema.js";

export const vehicleRouter = Router();
const vehicleService: Readonly<VehicleService> = new VehicleService();

vehicleRouter.get(
  "/",
  validateSchema({ query: getVehiclesSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const category = String(req.query.category ?? "");
    const search = String(req.query.search ?? "");
    const offset = (page - 1) * limit;

    const { vehicles, pagination } = await vehicleService.findAll({
      page,
      limit,
      category,
      search,
      offset,
    });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      data: vehicles,
      pagination: pagination,
    });
  }),
);

vehicleRouter.get(
  "/:id",
  validateSchema({ params: getVehicleByIdSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const vehicle = await vehicleService.findOne({ id });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      data: vehicle,
    });
  }),
);

vehicleRouter.post(
  "/",
  vehiclePhotoUpload.single("photo"),
  validateSchema({ body: createVehicleSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, plate_number, category, daily_rate } = req.body;

    const photoPath = req.file ? `/uploads/vehicles/${req.file.filename}` : null;
    const vehicle = await vehicleService.createVehicle({
      name,
      plate_number,
      category,
      daily_rate,
      photoPath,
    });

    res.status(StatusCodes.CREATED).json({
      statusCode: StatusCodes.CREATED,
      message: "Vehicle created successfully",
      data: vehicle,
    });
  }),
);

vehicleRouter.put(
  "/:id",
  vehiclePhotoUpload.single("photo"),
  validateSchema({ params: getVehicleByIdSchema ,  body: editVehicleSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, plate_number, category, daily_rate } = req.body;
    const id  = Number(req.params.id);

    const photoPath = req.file ? `/uploads/vehicles/${req.file.filename}` : null;
    const vehicle = await vehicleService.editVehicle({
      id,
      name,
      plate_number,
      category,
      daily_rate,
      photoPath,
    });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.CREATED,
      message: "Vehicle updated successfully",
      data: vehicle
    })
  }),
);


vehicleRouter.delete(
  "/:id",
  validateSchema({ params: deleteVehicleSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    await vehicleService.deleteVehicle({ id });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Vehicle deleted successfully",
    });
  }),
);
