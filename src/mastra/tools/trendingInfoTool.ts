// trendingInfoTool.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { newsTool } from "../tools/news-tool";
import { googleTool } from "../tools/google-tool";

export const trendingInfoTool = createTool({
  id: "get-trending-info",
  description: "Combines newsTool and googleTool to get trending person/topic info",
  inputSchema: z.object({}),
  outputSchema: z.object({
    trending: z.string(),
    summary: z.string(),
    source: z.string(),
  }),
  execute: async ({ context, runtimeContext }) => {
    try {
      const trendingData = await newsTool.execute({ 
        context: {},
        runtimeContext
      });
      if (trendingData.person === "Error") throw new Error("Failed to fetch trending topic");

      const infoData = await googleTool.execute({
        context: { query: trendingData.person },
        runtimeContext
      });

      return {
        trending: trendingData.person,
        summary: infoData.summary,
        source: infoData.source || trendingData.source,
      };
    } catch (error) {
      console.error("❌ Error in trendingInfoTool:", error);
      return {
        trending: "Error",
        summary: error instanceof Error ? error.message : "Unknown error occurred",
        source: "",
      };
    }
  },
});
