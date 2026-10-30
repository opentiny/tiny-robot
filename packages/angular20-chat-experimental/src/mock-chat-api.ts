import { defaultMcpTestService } from './app/services/mcp-test.service';

interface MockChatMessage {
  role?: string;
  content?: unknown;
}

interface MockChatRequest {
  model?: string;
  messages?: MockChatMessage[];
  enable_thinking?: boolean;
  enable_search?: boolean;
  tools?: Array<{ function?: { name?: string } }>;
}

interface MockMcpRequest {
  jsonrpc?: string;
  id?: string | number;
  method?: string;
  params?: { name?: string; arguments?: Record<string, unknown> };
}

function latestUserText(messages: MockChatMessage[] = []): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== 'user') continue;
    if (typeof message.content === 'string') return message.content;
    if (Array.isArray(message.content)) {
      return message.content
        .map((part) => {
          if (!part || typeof part !== 'object') return '';
          const value = part as Record<string, unknown>;
          if (typeof value['text'] === 'string') return value['text'];
          if (value['type'] === 'image_url') return '[图片 1]';
          return '';
        })
        .filter(Boolean)
        .join('\n');
    }
    if (Array.isArray(message.content)) {
      return message.content
        .map((part) => {
          if (!part || typeof part !== 'object') return '';
          const item = part as Record<string, unknown>;
          return item['type'] === 'image_url' ? '[图片]' : String(item['text'] ?? '');
        })
        .filter(Boolean)
        .join(' ');
    }
  }
  return '';
}

function chunk(model: string, content: string, finishReason: 'stop' | null = null): string {
  return `data: ${JSON.stringify({
    id: 'angular-deterministic-stream',
    object: 'chat.completion.chunk',
    created: 1,
    model,
    choices: [
      {
        index: 0,
        delta: finishReason ? {} : { role: 'assistant', content },
        logprobs: null,
        finish_reason: finishReason,
      },
    ],
  })}\n\n`;
}

function toolCallChunk(model: string, name: string, args: Record<string, unknown>): string {
  return `data: ${JSON.stringify({
    id: 'angular-deterministic-tool-call',
    object: 'chat.completion.chunk',
    created: 1,
    model,
    choices: [
      {
        index: 0,
        delta: {
          role: 'assistant',
          content: '',
          tool_calls: [
            {
              index: 0,
              id: 'call-angular-mcp-1',
              type: 'function',
              function: { name, arguments: JSON.stringify(args) },
            },
          ],
        },
        logprobs: null,
        finish_reason: 'tool_calls',
      },
    ],
  })}\n\ndata: [DONE]\n\n`;
}

function createMockResponse(request: MockChatRequest, signal?: AbortSignal): Response {
  const encoder = new TextEncoder();
  const model = request.model ?? 'angular-deterministic-model';
  const text = latestUserText(request.messages);
  const toolResult = [...(request.messages ?? [])]
    .reverse()
    .find((message) => message.role === 'tool')?.content;
  const systemInstructions = (request.messages ?? [])
    .filter((message) => message.role === 'system')
    .map((message) => String(message.content ?? ''))
    .join('\n');
  const requestedTool = request.tools?.find((tool) =>
    tool.function?.name?.endsWith(
      text.includes('天气')
        ? 'get_weather'
        : text.includes('图片')
          ? 'inspect_image'
          : 'search_project_code',
    ),
  )?.function?.name;
  if (!toolResult && requestedTool && /MCP|工具|搜索项目|天气|检查图片/.test(text)) {
    const args = requestedTool.endsWith('get_weather')
      ? { city: text.includes('上海') ? '上海' : '深圳' }
      : requestedTool.endsWith('inspect_image')
        ? { name: 'angular-test.png' }
        : { query: text.includes('force-error') ? 'force-error' : 'Runtime' };
    return new Response(toolCallChunk(model, requestedTool, args), {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  }
  const fragments = [
    '确定性',
    '模拟回答完成。',
    `深度思考：${request.enable_thinking ? '开启' : '关闭'}。`,
    `智能搜索：${request.enable_search ? '开启' : '关闭'}。`,
    ...(systemInstructions.includes('项目摘要 Skill') ? ['Skill 已执行：project-summary。'] : []),
    toolResult ? `MCP 工具结果：${String(toolResult)}` : `已收到：${text}`,
  ];
  let index = 0;
  let finished = false;

  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      if (signal?.aborted) {
        controller.error(new DOMException('The operation was aborted', 'AbortError'));
        return;
      }

      if (index < fragments.length) {
        controller.enqueue(encoder.encode(chunk(model, fragments[index++] ?? '')));
        return;
      }

      if (!finished) {
        finished = true;
        controller.enqueue(encoder.encode(chunk(model, '', 'stop')));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      }
      controller.close();
    },
  });

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}

async function createMockMcpResponse(request: MockMcpRequest): Promise<Response> {
  if (request.method === 'notifications/initialized') {
    return new Response(null, { status: 202 });
  }

  const result =
    request.method === 'initialize'
      ? {
          protocolVersion: '2025-03-26',
          capabilities: { tools: {} },
          serverInfo: { name: 'angular-deterministic-mcp', version: '1.0.0' },
        }
      : request.method === 'tools/list'
        ? {
            tools: [
              {
                name: 'search_project_code',
                description: '按关键词搜索当前项目代码。',
                inputSchema: {
                  type: 'object',
                  properties: { query: { type: 'string' } },
                  required: ['query'],
                },
              },
              {
                name: 'get_weather',
                description: '读取确定性的测试天气。',
                inputSchema: {
                  type: 'object',
                  properties: { city: { type: 'string' } },
                  required: ['city'],
                },
              },
              {
                name: 'inspect_image',
                description: '读取测试图片的元数据。',
                inputSchema: {
                  type: 'object',
                  properties: { name: { type: 'string' } },
                  required: ['name'],
                },
              },
            ],
          }
        : request.method === 'tools/call'
          ? {
              content: [
                {
                  type: 'text',
                  text: await defaultMcpTestService.call(
                    request.params?.name ?? '',
                    request.params?.arguments ?? {},
                  ),
                },
              ],
            }
          : {};

  return Response.json({ jsonrpc: '2.0', id: request.id, result });
}

export function installDeterministicChatApi(): void {
  const nativeFetch = globalThis.fetch.bind(globalThis);
  const mockUrl = new URL('/mock-chat/chat/completions', window.location.origin).href;
  const mockMcpUrl = new URL('/mock-mcp', window.location.origin).href;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const requestUrl = input instanceof Request ? input.url : String(input);
    const url = new URL(requestUrl, window.location.origin);
    const method = input instanceof Request ? input.method : (init?.method ?? 'GET');
    if (url.href === mockMcpUrl) {
      if (method.toUpperCase() === 'DELETE') return new Response(null, { status: 200 });
      if (method.toUpperCase() !== 'POST') return new Response(null, { status: 405 });

      const rawBody =
        input instanceof Request ? await input.clone().text() : String(init?.body ?? '');
      return createMockMcpResponse(rawBody ? (JSON.parse(rawBody) as MockMcpRequest) : {});
    }

    if (url.href !== mockUrl || method.toUpperCase() !== 'POST') return nativeFetch(input, init);

    const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as MockChatRequest) : {};
    return createMockResponse(body, init?.signal ?? undefined);
  };
}
