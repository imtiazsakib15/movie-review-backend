import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { genreService } from "./genre.service";
import { sendSuccess } from "../../utils/apiResponse";

export const genreController = {
  create: catchAsync(async (req: Request, res: Response) => {
    const genre = await genreService.create(req.body);
    sendSuccess(res, 201, "Genre created successfully", genre);
  }),

  list: catchAsync(async (_req: Request, res: Response) => {
    const genres = await genreService.list();
    sendSuccess(res, 200, "Genres retrieved successfully", genres);
  }),

  getById: catchAsync(async (req: Request, res: Response) => {
    const genre = await genreService.getById(req.params.id);
    sendSuccess(res, 200, "Genre retrieved successfully", genre);
  }),
};
