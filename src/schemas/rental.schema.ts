import { z } from "zod";

export const createRentalSchema = z
  .object({
    vehicle_id: z.coerce.number().int().positive(),

    customer_name: z.string().min(1, "Customer name is required").max(255),

    customer_phone: z.string().min(1, "Customer phone is required").max(30),

    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format"),

    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format"),
  })
  .refine((data) => data.start_date <= data.end_date, {
    message: "Start date cannot be after end date",
    path: ["end_date"],
  });

export type CreateRentalRequest = z.infer<typeof createRentalSchema>;

export const getReportByIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const getRentalsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  vehicle_id: z.coerce.string().optional(),
  status: z.enum(["booked", "ongoing", "completed", "cancelled"]).optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format")
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format")
    .optional(),
});

export type GetRentalsQuery = z.infer<typeof getRentalsSchema>;
