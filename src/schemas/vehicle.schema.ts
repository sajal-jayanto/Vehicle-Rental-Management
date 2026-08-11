import z from "zod";

export const createVehicleSchema = z.object({
  name: z.string().min(1, "Vehicle name is required").max(255),
  plate_number: z.string().min(1, "Plate number is required").max(50),
  category: z.string().min(1, "Category is required").max(100),
  daily_rate: z.coerce.number().positive("Daily rate must be greater than 0"),
});

export const editVehicleSchema = z.object({
  name: z.string().min(1, "Vehicle name is required").max(255),
  plate_number: z.string().min(1, "Plate number is required").max(50),
  category: z.string().min(1, "Category is required").max(100),
  daily_rate: z.coerce.number().positive("Daily rate must be greater than 0"),
});

export const getVehiclesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  category: z.string().max(100).optional(),
  search: z.string().max(255).optional(),
});

export const getVehicleByIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const deleteVehicleSchema = z.object({
  id: z.coerce.number().int().positive(),
});
