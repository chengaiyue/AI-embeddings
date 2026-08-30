/**
 * 统一 API 客户端。
 * 注意：前端只请求 NestJS 后端（/api/*），绝不直接访问 Python 服务。
 */

const BASE_URL = '/api';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      // 有 body 的 JSON 请求自动补 Content-Type；FormData 交给浏览器设置 boundary
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...getAuthHeaders(),
    },
    ...init,
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({ message: res.statusText }));
    if (res.status === 401) {
      clearToken();
    }
    throw new ApiError(res.status, payload.message ?? '请求失败');
  }
  return res.json() as Promise<T>;
}

export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function clearToken() {
  localStorage.removeItem('token');
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  upload: <T>(path: string, form: FormData) =>
    request<T>(path, { method: 'POST', body: form }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
