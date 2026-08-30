/** 对话 SSE 流式请求：POST /api/chat/completions，逐段解析 event-stream */
export interface ChatStreamCallbacks {
  onSources?: (sources: { docId: string; score: number; snippet: string }[]) => void;
  onDelta?: (text: string) => void;
  onDone?: () => void;
}

export async function streamChat(
  body: { sessionId: string; message: string; topK?: number },
  callbacks: ChatStreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch('/api/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    throw new Error(`SSE 请求失败: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  // 简易 SSE 解析：以空行分隔事件，data: 为 JSON 载荷
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const event of events) {
      const dataLine = event
        .split('\n')
        .find((line) => line.startsWith('data:'));
      if (!dataLine) continue;
      const payload = JSON.parse(dataLine.slice(5).trim());

      switch (payload.type) {
        case 'sources':
          callbacks.onSources?.(payload.sources);
          break;
        case 'delta':
          callbacks.onDelta?.(payload.content);
          break;
        case 'done':
          callbacks.onDone?.();
          break;
      }
    }
  }
}

import { getAuthHeaders } from './client';
