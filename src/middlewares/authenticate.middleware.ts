import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "./error.middleware.js";

export interface AuthenticatedStaff {
  id: number;
  email: string;
  name: string;
}

declare module "express-serve-static-core" {
  interface Request {
    staff?: AuthenticatedStaff;
  }
}

const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next(new HttpError("Authentication token is missing", StatusCodes.UNAUTHORIZED));
    return;
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    req.staff = jwt.verify(token, env.JWT_SECRET) as AuthenticatedStaff;
    next();
  } catch {
    next(new HttpError("Invalid or expired token", StatusCodes.UNAUTHORIZED));
  }
};

export { authenticate };
