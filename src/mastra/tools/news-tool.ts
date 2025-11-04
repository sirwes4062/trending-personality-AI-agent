// newsTool.ts
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import fetch from "node-fetch";
import nlp from "compromise"; // npm install compromise

export const newsTool = createTool({
  id: "get-trending-news",
  description: "Fetch and extract the most trending person or topic from multiple news sources",
  inputSchema: z.object({}),
  outputSchema: z.object({
    person: z.string(),
    description: z.string(),
    source: z.string(),
  }),
  execute: async () => {
    try {
      const NEWS_API_KEY = process.env.NEWS_API_KEY;
      if (!NEWS_API_KEY) throw new Error("Missing NEWS_API_KEY environment variable");

      // Fetch headlines from multiple sources
      const urls = [
        `https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_API_KEY}`,
        `https://newsapi.org/v2/top-headlines?category=entertainment&country=us&apiKey=${NEWS_API_KEY}`,
      ];

      const responses = await Promise.all(urls.map(url => fetch(url)));
      const jsonData = await Promise.all(responses.map(res => res.json()));

      // Combine all articles
      const allArticles = jsonData.flatMap(api => (api as { articles?: any[] }).articles || []);
      if (allArticles.length === 0) throw new Error("No articles found");

      // Extract all titles and run NLP
      const allTitles = allArticles.map(a => a.title).join(". ");
      const doc = nlp(allTitles);

      // Get people or named entities mentioned
      const people = doc.people().out("array");
      const topics = doc.nouns().out("array");

      const trending = people[0] || topics[0] || allArticles[0].title || "Unknown";

      return {
        person: trending,
        description: `Trending topic or person found in current US headlines`,
        source: allArticles[0]?.url || "",
      };
    } catch (error) {
      console.error("❌ Error fetching trending data:", error);
      return {
        person: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        source: "",
      };
    }
  },
});
