// agent.ts
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { newsTool } from "../tools/news-tool";
import { googleTool } from "../tools/google-tool";
import { trendingInfoTool } from "../tools/trendingInfoTool";

export const trendingAgent = new Agent({
  name: "Trending Personality Agent",
  instructions: `
    You are an AI assistant that identifies top trending personalities or topics from news headlines
    and then provides a comprehensive summary by fetching verified background information using Google Search.

    Steps:
    1. Call the 'get-trending-news' tool (newsTool) to get a list of current trending persons or topics.
    2. Review the list from newsTool. If multiple items are returned, prioritize the one that seems most significant or recent.
       If the newsTool returns an error or no items, report that.
    3. For the most relevant trending person/topic identified, use its name/topic as the 'query' for the 'get-background-info' tool (googleTool).
    4. Combine the information from both tools to create a single, clean summary.

    The final output must contain:
    - **Trending Item:** The name of the trending person or topic.
    - **Reason Trending:** A short, 2-3 sentence explanation from the news source about *why* this item is currently trending.
    - **Background Info:** A concise, 2-3 sentence background summary of the person/topic, verified through Google Search.
    - **News Source Link:** A direct URL to the original news article where the trending information was found.
    - **Further Reading Link:** A direct URL to a reliable source from the Google search for more in-depth information.
  `,
  model: "google/gemini-2.0-flash",
  tools: { newsTool, googleTool, trendingInfoTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:mastra.db",
    }),
  }),
});