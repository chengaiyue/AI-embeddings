import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { docId: string; score: number; snippet: string }[];
  streaming?: boolean;
}

interface ChatState {
  sessionId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  setSessionId: (id: string | null) => void;
  addMessage: (msg: ChatMessage) => void;
  appendToLast: (text: string) => void;
  setLastSources: (sources: ChatMessage['sources']) => void;
  finishLast: () => void;
  setStreaming: (v: boolean) => void;
  reset: () => void;
}

let nextId = 1;
export const genId = () => `local_${nextId++}`;

export const useChatStore = create<ChatState>((set) => ({
  sessionId: null,
  messages: [],
  isStreaming: false,
  setSessionId: (id) => set({ sessionId: id }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  appendToLast: (text) =>
    set((s) => {
      const messages = [...s.messages];
      const last = messages[messages.length - 1];
      if (last) {
        messages[messages.length - 1] = { ...last, content: last.content + text };
      }
      return { messages };
    }),
  setLastSources: (sources) =>
    set((s) => {
      const messages = [...s.messages];
      const last = messages[messages.length - 1];
      if (last) {
        messages[messages.length - 1] = { ...last, sources };
      }
      return { messages };
    }),
  finishLast: () =>
    set((s) => {
      const messages = [...s.messages];
      const last = messages[messages.length - 1];
      if (last) {
        messages[messages.length - 1] = { ...last, streaming: false };
      }
      return { messages };
    }),
  setStreaming: (v) => set({ isStreaming: v }),
  reset: () => set({ sessionId: null, messages: [], isStreaming: false }),
}));
