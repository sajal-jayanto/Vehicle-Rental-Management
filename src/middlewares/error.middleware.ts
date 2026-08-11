import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { MulterError } from "multer";
import { env } from "../config/env.js";

export class HttpError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    options?: { cause?: unknown; details?: unknown },
  ) {
    super(message, options);
    this.statusCode = statusCode;
    this.details = options?.details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const isKnownError = err instanceof HttpError || err instanceof MulterError;
  const statusCode =
    err instanceof HttpError
      ? err.statusCode
      : err instanceof MulterError
        ? StatusCodes.BAD_REQUEST
        : StatusCodes.INTERNAL_SERVER_ERROR;
  const message = isKnownError ? err.message : "Internal Server Error";
  const details = err instanceof HttpError ? err.details : undefined;

  if (env.nodeEnv !== "test") {
    req.log.error(err);
  }

  res.status(statusCode).json({
    statusCode: statusCode,
    message: message,
    ...(details !== undefined && { details }),
  });
};

export { errorHandler };
