import { env } from "../../config/env";

export class EmbeddingService {
  private apiKey: string;
  private apiUrl: string = "https://openrouter.ai/api/v1";
  private embeddingModel: string;

  constructor() {
    this.apiKey = env.OPENROUTER_API_KEY;
    this.embeddingModel = env.OPENROUTER_EMBEDDING_MODEL;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.apiUrl}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.embeddingModel,
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate embedding: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw error;
    }
  }
}
