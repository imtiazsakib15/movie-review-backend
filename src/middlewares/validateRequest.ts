import { Request, Response, NextFunction } from "express";
import z from "zod";

const validateRequest = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = await schema.parseAsync(req.body);
      req.body = parsedData;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequest;
