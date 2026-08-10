import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  name: z.string().min(2, { error: "Name must be at least 2 characters"}),
  email: z.email({ error: "Invalid email address" }),
  password: z.string().min(8, { error: "Password must be at least 8 characters" }),
});