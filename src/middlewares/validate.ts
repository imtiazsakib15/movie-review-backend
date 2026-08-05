import { Request, Response, NextFunction } from "express";
import z from "zod";

interface ValidationSchemas {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}

/**
 * Validates and reassigns req.body/query/params against the provided
 * Zod schemas. Throws a ZodError on failure, caught by errorHandler.
 */
export const validate =
  (schemas: ValidationSchemas) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (schemas.body) {
      req.body = await schemas.body.parseAsync(req.body);
    }
    if (schemas.query) {
      req.query = (await schemas.query.parseAsync(
        req.query,
      )) as typeof req.query;
    }
    if (schemas.params) {
      req.params = (await schemas.params.parseAsync(
        req.params,
      )) as typeof req.params;
    }
    next();
  };
