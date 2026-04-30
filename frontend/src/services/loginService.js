const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erro inesperado.' }));
    throw new Error(errorData.message || 'Erro inesperado.');
  }

  const text = await response.text();
  if (!text) return null;

  return JSON.parse(text);
}

export async function login(data) {
  const response = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  localStorage.setItem('token', response.token);
  return response;
}