import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../config/database";
import { EmbeddingService } from "./embedding.service";

const toVectorLiteral = (vector: number[]): string => `[${vector.join(", ")}]`;

export class IndexingService {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  async indexDocument(
    chunkKey: string,
    sourceType: string,
    sourceId: string,
    sourceLabel: string,
    content: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      const embedding = await this.embeddingService.generateEmbedding(content);
      const vectorLiteral = toVectorLiteral(embedding);

      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "document_embeddings" ("chunkKey", "sourceType", "sourceId", "sourceLabel", "content", "metadata", "embedding")
        VALUES (
          ${chunkKey}, 
          ${sourceType}, 
          ${sourceId}, 
          ${sourceLabel}, 
          ${content}, 
          ${metadata}::jsonb, 
          ${vectorLiteral}::vector
        ) 
        ON CONFLICT ("chunkKey") DO UPDATE SET
          "sourceType" = EXCLUDED."sourceType",
          "sourceId" = EXCLUDED."sourceId",
          "sourceLabel" = EXCLUDED."sourceLabel",
          "content" = EXCLUDED."content",
          "metadata" = EXCLUDED."metadata",
          "embedding" = EXCLUDED."embedding"
      `);
    } catch (error) {
      console.error(
        `Error indexing document with chunkKey ${chunkKey}:`,
        error,
      );
      throw error;
    }
  }

  async indexAllMediaData(): Promise<any> {
    // Implement the logic to index all media data using the embedding service
    const media = await prisma.media.findMany({
      where: {
        isPublished: true,
      },
      include: {
        reviews: true,
        mediaGenres: {
          include: {
            genre: true,
          },
        },
      },
    });
    let indexedCount = 0;
    for (const mediaItem of media) {
      const genresList = mediaItem.mediaGenres
        .map((mg) => mg.genre.name)
        .join("\n");

      const reviewsText = mediaItem.reviews.map(
        (r) => `- Rating: ${r.rating}/10, Review: ${r.content}`,
      );

      const content = `Title: ${mediaItem.title}
                      Description: ${mediaItem.description}
                      Genres:\n${genresList}
                      Reviews:\n${reviewsText.join("\n")}
                      Average Rating: ${mediaItem.ratingCount}/10`;

      const metadata = {
        id: mediaItem.id,
        title: mediaItem.title,
        description: mediaItem.description,
        genres: mediaItem.mediaGenres.map((mg) => mg.genre.name),
        averageRating: mediaItem.ratingCount / 10,
      };

      const chunkKey = `media-${mediaItem.id}`;

      await this.indexDocument(
        chunkKey,
        "Media",
        mediaItem.id,
        mediaItem.title,
        content,
        metadata,
      );

      indexedCount++;
    }

    console.log(`Successfully indexed ${indexedCount} media items.`);
    return {
      message: `Successfully indexed ${indexedCount} media items.`,
      indexedCount,
    };
  }
}
