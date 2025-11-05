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
      const { message, messages, contextId, taskId, metadata } = params || {};
      let messagesList: any[] = [];
      if (message) messagesList = [message];
      else if (Array.isArray(messages)) messagesList = messages;
      // :white_check_mark: Convert incoming → Mastra format
      const mastraMessages = messagesList.map((msg: any) => ({
        role: msg.role,
        content: msg.parts
          ?.map((part: any) =>
            part.kind === 'text' ? part.text : JSON.stringify(part.data)
          )
          .join('\n') || ''
      }));
      // :white_check_mark: Correct agent call (your agent uses createAgent → so it uses generate())
      const response = await agent.generate(mastraMessages, metadata);
      // :white_check_mark: Correct output key
      const agentText = response.text ?? '';
      const artifacts = [
        {
          artifactId: randomUUID(),
          name: `${agentId}Response`,
          parts: [{ kind: 'text', text: agentText }]
        }
      ];
      if (response.toolResults?.length) {
        artifacts.push({
          artifactId: randomUUID(),
          name: 'ToolResults',
          parts: response.toolResults.map((result: any) => ({
              kind: "text",
              text :typeof result === 'string' ? result : JSON.stringify(result)
          }))
        });
      }
      const history = [
        ...messagesList.map((msg: any) => ({
          kind: 'message',
          role: msg.role,
          parts: msg.parts,
          messageId: msg.messageId || randomUUID(),
          taskId: msg.taskId || taskId || randomUUID(),
        })),
        {
          kind: 'message',
          role: 'agent',
          parts: [{ kind: 'text', text: agentText }],
          messageId: randomUUID(),
          taskId: taskId || randomUUID(),
        }
      ];
      return c.json({
        jsonrpc: '2.0',
        id: requestId,
        result: {
          id: taskId || randomUUID(),
          contextId: contextId || randomUUID(),
          status: {
            state: 'completed',
            timestamp: new Date().toISOString(),
            message: {
              messageId: randomUUID(),
              role: 'agent',
              parts: [{ kind: 'text', text: agentText }],
              kind: 'message'
            }
          },
          artifacts,
          history,
          kind: 'task'
        }
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      return c.json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32603,
          message: 'Internal error',
          data: { details: error.message }
        }
      }, 500);
    }
  }
});