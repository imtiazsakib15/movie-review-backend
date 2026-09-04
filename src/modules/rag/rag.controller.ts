import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { sendSuccess } from "../../utils/apiResponse";
import { RAGService } from "./rag.service";

const ragService = new RAGService();

export const ragController = {
  ingestAllMedia: catchAsync(async (req: Request, res: Response) => {
    const rag = await ragService.ingestAllMediaData();
    sendSuccess(res, 201, "Ingested all media data successfully!", rag);
  }),
};
