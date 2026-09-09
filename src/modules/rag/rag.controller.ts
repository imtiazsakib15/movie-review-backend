import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import { RAGService } from "./rag.service";
import { ApiError } from "../../errors/apiError";

const ragService = new RAGService();

export const ragController = {
  ingestAllMedia: catchAsync(async (req: Request, res: Response) => {
    const rag = await ragService.ingestAllMediaData();
    sendSuccess(res, 201, "Ingested all media data successfully!", rag);
  }),

  mediaQuery: catchAsync(async (req: Request, res: Response) => {
    const body = req.body;
    const { query, sourceType, limit } = body;
    if (!query) {
      throw ApiError.badRequest("Query is required");
    }

    const rag = await ragService.generateAnswer(
      query,
      sourceType,
      limit,
      false,
    );
    sendSuccess(res, 200, "Answer generated successfully!", rag);
  }),

  getStats: catchAsync(async (req: Request, res: Response) => {
    const stats = await ragService.getStats();
    sendSuccess(res, 200, "RAG stats retrieved successfully!", stats);
  }),
};
