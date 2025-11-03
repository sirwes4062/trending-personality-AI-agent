// googleTool.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import fetch from "node-fetch";

export const googleTool = createTool({
  id: "get-person-info",
  description: "Fetch background info about a person or topic using Google APIs",
  inputSchema: z.object({
    query: z.string().describe("Name of the person or topic to search for"),
  }),
  outputSchema: z.object({
    summary: z.string(),
    source: z.string(),
  }),
  execute: async ({ context }) => {
    try {
      const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
      const SEARCH_ENGINE_ID = process.env.SEARCH_ENGINE_ID;
      if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID)
        throw new Error("Missing GOOGLE_API_KEY or SEARCH_ENGINE_ID");

      const query = encodeURIComponent(context.query);

      // Fetch from Google Knowledge Graph
      const kgUrl = `https://kgsearch.googleapis.com/v1/entities:search?query=${query}&key=${GOOGLE_API_KEY}`;
      const kgRes = await fetch(kgUrl);
      const kgData = await kgRes.json() as {
        itemListElement?: Array<{
          result?: {
            detailedDescription?: { articleBody?: string; url?: string };
            description?: string;
          };
        }>;
      };

      const entity = kgData.itemListElement?.[0]?.result;
      const kgSummary =
        entity?.detailedDescription?.articleBody ||
        entity?.description ||
        "";
      const kgSource = entity?.detailedDescription?.url || "";

      // Fallback to Google Custom Search if no good summary
      if (!kgSummary) {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json() as {
          items?: Array<{ snippet?: string; link?: string }>;
        };

        const firstResult = searchData.items?.[0];
        return {
          summary: firstResult?.snippet || "No summary found",
          source: firstResult?.link || "",
        };
      }

      return {
        summary: kgSummary,
        source: kgSource || "",
      };
    } catch (error) {
      console.error("❌ Error in googleTool:", error);
      return {
        summary: "Unable to fetch information",
        source: "",
      };
    }
  },
});
