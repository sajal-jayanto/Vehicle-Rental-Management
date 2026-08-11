import { z } from "zod";

export const getReportSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid month format, expected YYYY-MM")
    .optional(),
  vehicle_id: z.coerce.number().int().positive().optional(),
});
