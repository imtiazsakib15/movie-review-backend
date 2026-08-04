import { Request, Response, NextFunction } from "express";
import z from "zod";

const validateRequestWithFormData = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedFormData = JSON.parse(req.body.data);
      const parsedData = await schema.parseAsync(parsedFormData);
      req.body = parsedData;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validateRequestWithFormData;
