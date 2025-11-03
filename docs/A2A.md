# A2A Protocol Integration

This document shows how to interact with the trending person AI agent using the A2A (Agent-to-Agent) protocol.

## Protocol Details
- Endpoint: `/a2a/agent/trendingAgent`
- Method: POST
- Format: JSON-RPC 2.0

## Example Request

```bash
curl -X POST http://localhost:4111/a2a/agent/trendingAgent \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "request-123",
    "method": "generate",
    "params": {
      "message": {
        "role": "user",
        "parts": [
          {
            "kind": "text",
            "text": "Who is trending right now?"
          }
        ],
        "messageId": "msg-123"
      },
      "taskId": "task-123",
      "contextId": "ctx-123"
    }
  }'
```

## Example Response

```json
{
  "jsonrpc": "2.0",
  "id": "request-123",
  "result": {
    "id": "task-123",
    "contextId": "ctx-123",
    "status": {
      "state": "completed",
      "timestamp": "2025-11-03T08:30:00.000Z",
      "message": {
        "messageId": "msg-456",
        "role": "agent",
        "parts": [
          {
            "kind": "text",
            "text": "The currently trending person is..."
          }
        ],
        "kind": "message"
      }
    },
    "artifacts": [
      {
        "artifactId": "art-123",
        "name": "trendingAgentResponse",
        "parts": [
          {
            "kind": "text",
            "text": "The currently trending person is..."
          }
        ]
      },
      {
        "artifactId": "art-456",
        "name": "ToolResults",
        "parts": [
          {
            "kind": "data",
            "data": {
              "person": "John Doe",
              "description": "Famous for...",
              "source": "news.com"
            }
          }
        ]
      }
    ],
    "history": [...],
    "kind": "task"
  }
}
```

## Integration Notes

1. Your agent is available at the A2A endpoint `/a2a/agent/trendingAgent`
2. All requests must follow JSON-RPC 2.0 format with:
   - `jsonrpc: "2.0"`
   - unique `id`
   - `method: "generate"`
   - proper `params` structure

3. Messages can be sent either as:
   - Single message in `params.message`
   - Array of messages in `params.messages`

4. Response includes:
   - Agent's text response in both `status.message` and first artifact
   - Tool results (if any) in second artifact
   - Complete conversation history
   - Task and context IDs for continuity

5. Error responses follow JSON-RPC 2.0 error format:
   ```json
   {
     "jsonrpc": "2.0",
     "id": "request-123",
     "error": {
       "code": -32603,
       "message": "Internal error",
       "data": { "details": "..." }
     }
   }
   ```

## Testing
1. Start the Mastra dev server:
   ```bash
   pnpm run dev
   ```

2. Send a test request (using curl or any HTTP client)
3. Check the response format matches A2A protocol expectations

## Common Issues
- If agent not found: verify the agentId matches "trendingAgent"
- If invalid request: ensure JSON-RPC 2.0 format is correct
- If parsing error: check message structure matches examples above