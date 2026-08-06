import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { genreService } from "./genre.service";
import { sendSuccess } from "../../utils/apiResponse";

export const genreController = {
  create: catchAsync(async (req: Request, res: Response) => {
    const genre = await genreService.create(req.body);
    sendSuccess(res, 201, "Genre created successfully", genre);
  }),
};
