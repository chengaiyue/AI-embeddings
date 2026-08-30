import { useRef, useState } from 'react';
import { streamChat } from '../../api/chat';
import { api } from '../../api/client';
import { genId, useChatStore, type ChatMessage } from '../../store/chatStore';
import styles from './index.module.css';

export default function ChatAi() {
  const { sessionId, messages, isStreaming, setSessionId, addMessage, appendToLast, setLastSources, finishLast, setStreaming } =
    useChatStore();
  const [input, setInput] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const ensureSession = async (): Promise<string> => {
    if (sessionId) return sessionId;
    const { id } = await api.post<{ id: string }>('/chat/sessions', {});
    setSessionId(id);
    return id;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = { id: genId(), role: 'user', content: text };
    const assistantMsg: ChatMessage = { id: genId(), role: 'assistant', content: '', streaming: true };
    addMessage(userMsg);
    addMessage(assistantMsg);
    setInput('');
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const sid = await ensureSession();
      await streamChat(
        { sessionId: sid, message: text },
        {
          onSources: (sources) => setLastSources(sources),
          onDelta: (delta) => appendToLast(delta),
          onDone: () => finishLast(),
        },
        controller.signal,
      );
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        appendToLast(`\n\n[出错] ${(e as Error).message}`);
      }
    } finally {
      finishLast();
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => abortRef.current?.abort();

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {messages.length === 0 && <p className={styles.empty}>向知识库提问，例如："这份文档讲了什么？"</p>}
        {messages.map((msg) => (
          <div key={msg.id} className={msg.role === 'user' ? styles.userMsg : styles.assistantMsg}>
            <div className={styles.role}>{msg.role === 'user' ? '我' : 'AI'}</div>
            <div className={styles.bubble}>
              {msg.content || (msg.streaming ? '思考中…' : '')}
              {msg.streaming && <span className={styles.cursor}>▍</span>}
              {msg.sources && msg.sources.length > 0 && (
                <details className={styles.sources}>
                  <summary>引用来源（{msg.sources.length}）</summary>
                  <ul>
                    {msg.sources.map((s, i) => (
                      <li key={i}>
                        [{s.docId}]（相似度 {s.score.toFixed(2)}）：{s.snippet}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.inputBar}>
        <textarea
          value={input}
          placeholder="输入你的问题…（Enter 发送，Shift+Enter 换行）"
          rows={2}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
        />
        {isStreaming ? (
          <button className={styles.stopBtn} onClick={handleStop}>
            停止
          </button>
        ) : (
          <button onClick={() => void handleSend()} disabled={!input.trim()}>
            发送
          </button>
        )}
      </div>
    </div>
  );
}
