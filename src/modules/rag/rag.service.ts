import { EmbeddingService } from "./embedding.service";
import { IndexingService } from "./indexing.service";
import { LLMService } from "./llm.service";

export class RAGService {
  private embeddingService: EmbeddingService;
  // private llmService: LLMService;
  private indexingService: IndexingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
    // this.llmService = new LLMService();
    this.indexingService = new IndexingService();
  }

  async ingestAllMediaData(): Promise<any> {
    try {
      return await this.indexingService.indexAllMediaData();
    } catch (error) {
      console.error("Error ingesting all media data:", error);
      throw error;
    }
  }
}
