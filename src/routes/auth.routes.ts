import { Router, type Request, type Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { AuthService } from "../service/auth.service.js";
import { StatusCodes } from "http-status-codes";
import { validateSchema } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";

export const authRouter = Router();
const authService: Readonly<AuthService> = new AuthService();

authRouter.post(
  "/register",
  validateSchema({ body: registerSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    const staff = await authService.register({ name, email, password });

    res.status(StatusCodes.CREATED).json({
      status: "success",
      data: staff,
    });
  }),
);

authRouter.post(
  "/login",
  validateSchema({ body: loginSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    res.status(StatusCodes.OK).json({
      status: "success",
      data: result,
    });
  }),
);
