import { registerApiRoute } from '@mastra/core/server';
import { randomUUID } from 'crypto';
export const a2aAgentRoute = registerApiRoute('/a2a/agent/:agentId', {
  method: 'POST',
  handler: async (c) => {
    try {
      const mastra = c.get('mastra');
      const agentId = c.req.param('agentId');
      const body = await c.req.json();
      const { jsonrpc, id: requestId, params } = body;
      if (jsonrpc !== '2.0' || !requestId) {
        return c.json({
          jsonrpc: '2.0',
          id: requestId || null,
          error: {
            code: -32600,
            message: 'Invalid Request: jsonrpc must be "2.0" and id is required'
          }
        }, 400);
      }
      const agent = mastra.getAgent(agentId);
      if (!agent) {
        return c.json({
          jsonrpc: '2.0',
          id: requestId,
          error: { code: -32602, message: `Agent '${agentId}' not found` }
        }, 404);
      }
      const messageList = params?.messages || [];
      // Convert Telex → Mastra format
      const mastraMessages = messageList.map((m: any) => ({
        role: m.role,
        content: m.parts.map((p: any) => p.text).join(' ')
      }));
      // Run Agent (generate)
      const result = await agent.generate(mastraMessages, params?.metadata);
      const agentText = result.text || '';
      // :white_check_mark: **Return EXACT format Telex requires**
      return c.json({
        jsonrpc: '2.0',
        id: requestId,
        result: {
          status: {
            message: {
              parts: [
                { kind: 'text', text: agentText }
              ]
            }
          }
        }
      });
    } catch (err: any) {
      return c.json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: err?.message || 'Internal error'
        }
      }, 500);
    }
  }
});