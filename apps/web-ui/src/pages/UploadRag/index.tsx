import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteDocument, listDocuments, uploadDocument, type RagDocument } from '../../api/rag';
import styles from './index.module.css';

export default function UploadRag() {
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      setDocuments(await listDocuments());
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载文档列表失败');
    }
  }, []);

  useEffect(() => {
    void refresh();
    // 处理中的文档每 3s 轮询一次状态
    const timer = setInterval(() => void refresh(), 3000);
    return () => clearInterval(timer);
  }, [refresh]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      await uploadDocument(file);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : '上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
    await refresh();
  };

  return (
    <div className={styles.container}>
      <section className={styles.uploadCard}>
        <h2>上传文档到知识库</h2>
        <p className={styles.hint}>支持 pdf / md / txt / docx，单个文件不超过 50MB</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.md,.txt,.docx"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
          }}
        />
        {uploading && <p className={styles.processing}>上传中，服务端正在解析并向量化…</p>}
        {error && <p className={styles.error}>{error}</p>}
      </section>

      <section>
        <h2>知识库文档（{documents.length}）</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>文件名</th>
              <th>状态</th>
              <th>切片数</th>
              <th>上传时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>{doc.filename}</td>
                <td>
                  <span className={styles[doc.status] ?? ''}>
                    {doc.status === 'processing' ? '处理中' : doc.status === 'ready' ? '就绪' : '失败'}
                  </span>
                </td>
                <td>{doc.chunks}</td>
                <td>{new Date(doc.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => void handleDelete(doc.id)}>删除</button>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={5}>暂无文档，先上传一个吧</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
