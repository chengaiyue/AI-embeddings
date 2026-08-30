import { api } from './client';

export interface RagDocument {
  id: string;
  filename: string;
  status: 'processing' | 'ready' | 'failed';
  chunks: number;
  createdAt: string;
}

export function uploadDocument(file: File, collection = 'default') {
  const form = new FormData();
  form.append('file', file);
  form.append('collection', collection);
  return api.upload<RagDocument>('/rag/documents', form);
}

export function listDocuments() {
  return api.get<RagDocument[]>('/rag/documents');
}

export function deleteDocument(id: string) {
  return api.delete<void>(`/rag/documents/${id}`);
}
