
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { trendingAgent } from "./agents/trendingAgent";
import { a2aAgentRoute } from './routes/a2a';
// import { trendingRoute } from './routes/trending-route';

export const mastra = new Mastra({
  bundler: {externals: ['express']},

  agents: { trendingAgent },
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









