const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token');
  const shouldUseAuth = options.auth !== false;
  const { auth, headers, ...fetchOptions } = options;

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(shouldUseAuth && token && { Authorization: `Bearer ${token}` }),
      ...(headers ?? {}),
    },
    ...fetchOptions,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || 'Erro inesperado.');
  }

  return data;
}
