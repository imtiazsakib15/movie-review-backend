import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../errors/apiError";
import { EmbeddingService } from "./embedding.service";
import { IndexingService } from "./indexing.service";
import { LLMService } from "./llm.service";
import { ragResponseSchema } from "./rag.validation";

export class RAGService {
  private embeddingService: EmbeddingService;
  private llmService: LLMService;
  private indexingService: IndexingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
    this.llmService = new LLMService();
    this.indexingService = new IndexingService();
  }

  async ingestAllMediaData(): Promise<any> {
    try {
      return await this.indexingService.indexAllMediaData();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal("Failed to ingest all media data");
    }
  }

  async getRelevantDocuments(
    query: string,
    sourceType?: string,
    limit: number = 5,
  ): Promise<any> {
    try {
      const queryEmbedding =
        await this.embeddingService.generateEmbedding(query);

      const vectorLiteral = `[${queryEmbedding.join(",")}]`;
      const results = await prisma.$queryRaw(Prisma.sql`
        SELECT id, "chunkKey", "sourceType", "sourceId", "sourceLabel", content, metadata, embedding, "isDeleted", "deletedAt", "created_at", "updated_at", 1 - (embedding <=> CAST(${vectorLiteral} AS vector)) as similarity
        FROM "document_embeddings"
        WHERE "isDeleted" = false
        ${sourceType ? Prisma.sql`AND "sourceType" = ${sourceType}` : Prisma.empty}
        ORDER BY embedding <=> CAST(${vectorLiteral} AS vector)
        LIMIT ${limit}
      `);

      return results;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal("Failed to retrieve relevant documents");
    }
  }

  async generateAnswer(
    query: string,
    sourceType?: string,
    limit: number = 5,
    asJson: boolean = false,
  ): Promise<any> {
    try {
      interface RelevantDocs {
        id: string;
        chunkKey: string;
        sourceType: string;
        sourceId: string;
        sourceLabel: string;
        content: string | null;
        metadata: unknown;
        similarity: number;
      }
      const relevantDocs: RelevantDocs[] = await this.getRelevantDocuments(
        query,
        sourceType,
        limit,
      );

      const context = relevantDocs
        .filter((doc) => doc.content)
        .map(
          (doc: RelevantDocs) => `
            Source ID: ${doc.sourceId}
            Source Type: ${doc.sourceType}
            Source Label: ${doc.sourceLabel}
            Content:
            ${doc.content}
            `,
        )
        .join("\n\n---\n\n");

      const answer = await this.llmService.generateResponse(
        query,
        context,
        asJson,
      );

      if (!asJson) {
        return answer;
      }

      let parsed: unknown;

      try {
        parsed = JSON.parse(answer);
      } catch {
        throw ApiError.badGateway("LLM returned invalid JSON");
      }

      const validated = ragResponseSchema.safeParse(parsed);

      if (!validated.success) {
        throw ApiError.badGateway("LLM returned an invalid response structure");
      }

      return validated.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal("Failed to generate answer from LLM service");
    }
  }

  async getStats(): Promise<any> {
    try {
      const totalDocuments = await prisma.documentEmbedding.count({
        where: { isDeleted: false },
      });
      const sourceTypeCounts = await prisma.documentEmbedding.groupBy({
        by: ["sourceType"],
        _count: { sourceType: true },
        where: { isDeleted: false },
      });
      const sourceTypeCountModified = sourceTypeCounts.map((item) => ({
        sourceType: item.sourceType,
        count: item._count.sourceType,
      }));

      return { totalDocuments, sourceTypeCounts: sourceTypeCountModified };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw ApiError.internal("Failed to retrieve RAG stats");
    }
  }
}
