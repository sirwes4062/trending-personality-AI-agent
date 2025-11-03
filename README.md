# Trending Person AI Agent

This repository contains a Mastra-based AI agent that finds and summarizes the currently trending person or topic from news sources and augments that with quick information lookups.

The project is organized to run locally with the Mastra CLI, build into a `.mastra` output, and deploy to Mastra Cloud (so it can be integrated with platforms such as Telex.im).

## Quick summary
- Language: TypeScript (Node.js)
- Framework: Mastra (agents, tools, workflows)
- Purpose: Detect the most trending person/topic from news headlines, fetch summary information, and provide it via an agent API.

## Prerequisites
- Node.js >= 20.9.0 (this project used Node v22+ in development)
- pnpm (preferred package manager)
- A Mastra Cloud account (for cloud deploy)

## Install
From the project root:

```bash
pnpm install
```

## Environment variables
Create `.env` or `.env.production` with the API keys (used by the tools):

```bash
# .env or .env.production
NEWS_API_KEY=your_newsapi_api_key
GOOGLE_API_KEY=your_google_api_key
MASTRA_API_KEY=your_mastra_cloud_api_key   # only if required for cloud deploy/login
```

## Run in development
The project uses the Mastra CLI dev server. Run:

```bash
pnpm run dev
```

Notes:
- If you see an error like `ERROR ... The service was stopped: write EPIPE`, this often happens when the bundler fails during the build step and the dev wrapper loses the child process pipe. A common root cause is a project path with spaces or special characters. Move the project to a path without spaces (e.g., `D:/dev/trending-ai-agent`) or use a junction/symlink.

## Build (produce .mastra output)

```bash
pnpm run build
```

If build fails with a `PLUGIN_ERROR` or resolver error, check:
- That your `src/mastra/index.ts` and imports are valid
- That the project path does not contain spaces or Unicode characters that the bundler may mishandle

## Start a built server
After a successful build you can run the bundled output directly:

```bash
# run from repo root
node --import=./.mastra/output/instrumentation.mjs .mastra/output/index.mjs
```

## Deploy to Mastra Cloud
(Requires `@mastra/deployer-cloud`/`mastra` CLI and a Mastra Cloud account.)

1. Install cloud deploy dependencies (if needed):

```bash
pnpm add -D @mastra/deployer-cloud @mastra/cloud
```

2. Log into Mastra Cloud (interactive):

```bash
pnpm exec mastra login
```

3. Ensure production env file exists:

```bash
# example
cat > .env.production <<'EOF'
NEWS_API_KEY=your_news_api_key
GOOGLE_API_KEY=your_google_api_key
EOF
```

4. Deploy (staging):

```bash
pnpm run deploy
```

5. Deploy production:

```bash
pnpm run deploy:prod
```

After deployment you will receive a deployment URL and credentials. Mastra Cloud may also provide pre-built integrations such as Telex.im — configure those from your Mastra Cloud dashboard, or use the `deployment.ts` file (if present) to specify integration metadata.

## Integrate with Telex.im
- Use the Mastra Cloud deployment URL (or provided Telex integration link) and follow Telex.im's "Add Agent" flow.
- Configure the agent name, description and allowed API keys in Telex based on the deployed Mastra endpoint and credentials.

## Project structure

```
package.json
src/
  mastra/
    index.ts              # Mastra app config (agents, storage, observability)
    agents/
      trendingAgent.ts    # Agent that exposes the trending-person functionality
    tools/
      news-tool.ts        # Fetch headlines and extract trending person/topic
      google-tool.ts      # Fetch summary information from Google or search API
      trendingInfoTool.ts # Wrapper tool that combines news + google tools
    workflows/
      weather-workflow.ts # example workflow (if present in repo)
    scorers/
      weather-scorer.ts   # evaluation scorers (LLM and code-based)
```

### Key files
- `src/mastra/index.ts` — Mastra application bootstrap (register agents, tools, workflows)
- `src/mastra/tools/news-tool.ts` — fetches headlines and extracts trending persons/topics
- `src/mastra/tools/google-tool.ts` — simple search/summarization tool
- `src/mastra/tools/trendingInfoTool.ts` — composes `newsTool` + `googleTool`
- `src/mastra/agents/trendingAgent.ts` — the agent that provides the public interface

## Testing the agent locally
- Use the Mastra dev server and call the agent endpoints via the playground or the API endpoints printed by Mastra dev.
- You can also directly call the tool functions in a small script (mock the environment keys) and run `ts-node` or `node` after compilation.

## Troubleshooting
- EPIPE / Dev server stops: see notes above about bundler failure and path issues.
- Missing `mastra` CLI: use `pnpm exec -- mastra ...` to run the locally installed CLI if the global command is not available.
- Missing runtime types: ensure TypeScript `tsconfig.json` and project `type: "module"` are compatible; Mastra expects modern Node and bundler-friendly TypeScript settings.

## Contributing
- Add or update `src/mastra/tools/*`, `agents/*`, `workflows/*` and export them in `src/mastra/index.ts`.
- Keep `zod` schemas to validate `inputSchema` and `outputSchema` for tools/steps.
- Run `pnpm run build` and `pnpm run dev` to validate changes locally.

## Next steps / Recommendations
- Replace in-memory `LibSQLStore` in `index.ts` with a persistent store for production (e.g., `file:../mastra.db` or an external DB URL).
- Add unit tests for the tools (mock fetch responses) and small integration tests for the agent.
- Add CI that runs `pnpm install && pnpm run build` on PRs.

## License
This project uses the ISC license as defined in `package.json`.

---

If you want, I can:
- Generate a short `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`.
- Create example curl requests to call the deployed agent API (once you have a deployment URL).
- Add a one-click deploy script for Mastra Cloud (if you provide the required account details).

Tell me which follow-up you prefer and I'll implement it.