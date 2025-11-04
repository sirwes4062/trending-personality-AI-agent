
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { trendingAgent } from "./agents/trendingAgent";
import { a2aAgentRoute } from './routes/a2a';

export const mastra = new Mastra({
  agents: { trendingAgent },
  // routes: [a2aAgentRoute],
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    enabled: false, 
  },
  observability: {
    default: { enabled: true }, 
  },

   server: {
    apiRoutes: [a2aAgentRoute]
  }
});








