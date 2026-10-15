interface MockChatMessage {
  role?: string;
  content?: unknown;
}

interface MockChatRequest {
  model?: string;
  messages?: MockChatMessage[];
  enable_thinking?: boolean;
  enable_search?: boolean;
}

function latestUserText(messages: MockChatMessage[] = []): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === 'user' && typeof message.content === 'string') return message.content;
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

function createMockResponse(request: MockChatRequest, signal?: AbortSignal): Response {
  const encoder = new TextEncoder();
  const model = request.model ?? 'angular-deterministic-model';
  const text = latestUserText(request.messages);
  const fragments = [
    '确定性',
    '模拟回答完成。',
    `深度思考：${request.enable_thinking ? '开启' : '关闭'}。`,
    `智能搜索：${request.enable_search ? '开启' : '关闭'}。`,
    `已收到：${text}`,
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

export function installDeterministicChatApi(): void {
  const nativeFetch = globalThis.fetch.bind(globalThis);
  const mockUrl = new URL('/mock-chat/chat/completions', window.location.origin).href;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const requestUrl = input instanceof Request ? input.url : String(input);
    const url = new URL(requestUrl, window.location.origin);
    const method = input instanceof Request ? input.method : (init?.method ?? 'GET');
    if (url.href !== mockUrl || method.toUpperCase() !== 'POST') return nativeFetch(input, init);

    const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as MockChatRequest) : {};
    return createMockResponse(body, init?.signal ?? undefined);
  };
}
