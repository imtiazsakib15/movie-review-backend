import { env } from "../../config/env";
import { ApiError } from "../../errors/apiError";

export class LLMService {
  private apiKey: string;
  private apiUrl: string = "https://openrouter.ai/api/v1";
  private model: string;

  constructor() {
    this.apiKey = env.OPENROUTER_API_KEY;
    this.model = env.OPENROUTER_LLM_MODEL;
  }

  async generateResponse(
    query: string,
    context: string,
    asJson: boolean = false,
  ): Promise<any> {
    try {
      // Combine context with prompt to create a full prompt for the LLM
      let fullPrompt = `Context: ${context}\n\nQuestion: ${query}\n\nAnswer the question based on the context provided.`;
      const systemMessage = asJson
        ? `
        You are a movie information assistant.

        Your job is to answer the user's question using ONLY the information provided in the context.

        Rules:
        - Treat the provided context as the only source of truth.
        - Do not use outside knowledge.
        - Do not invent, assume, or guess facts.
        - If the context is insufficient, set the answer to:
        "Insufficient context to answer the question."
        - Keep the answer relevant to the question.
        - If the context contains conflicting information, acknowledge the conflict.
        - Every source must come from the provided context.

        Return ONLY valid JSON in this format:

        {
        "answer": "string",
        "sources": [
            {
            "type": "media" | "review",
            "id": "string",
            "mediaId": "string",
            "title": "string",
            "rating": "number | null",
            "snippet": "string"
            }
        ]
        }

        Source rules:
        - Use "media" for media sources.
        - Use "review" for review sources.
        - For media sources, rating must be null.
        - For review sources, rating must contain the review rating.
        - Do not invent IDs, titles, ratings, or facts.
        - snippet should briefly explain why the source supports the answer.
        - If the context is insufficient, return an empty sources array.
        - Return JSON only.
        - No markdown or code fences.
        `
        : `
        You are a movie information assistant.

        Your job is to answer the user's question using ONLY the information provided in the context.

        Rules:
        - Treat the provided context as the only source of truth.
        - Do not use outside knowledge or information that is not present in the context.
        - Do not invent, assume, or guess facts.
        - If the context does not contain enough information to answer the question, clearly say:
        "Insufficient context to answer the question."
        - Keep the answer relevant to the user's question.
        - When the context contains conflicting information, acknowledge the conflict instead of choosing an answer without evidence.
        - If sources are provided in the context, base your answer on those sources.
        `;

      const bodyPayload: Record<string, unknown> = {
        model: this.model,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: fullPrompt },
        ],
        temperature: 0.1,
        max_tokens: 1500,
      };

      if (
        asJson &&
        (this.model.includes("gpt") || this.model.includes("openai"))
      ) {
        bodyPayload.response_format = {
          type: "json_object",
        };
      }

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": env.CLIENT_URL,
          "X-Title": "Cinevoo Movie Review Application",
        },
        body: JSON.stringify(bodyPayload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          response.status,
          `Failed to generate answer: ${errorData.error?.message || "Unknown error"}`,
        );
      }
      const data = await response.json();

      return data.choices[0].message.content;
    } catch (error) {
      throw ApiError.internal("Failed to generate answer from LLM service");
    }
  }
}
