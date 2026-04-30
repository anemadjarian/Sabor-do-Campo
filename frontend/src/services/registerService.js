const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    // credentials: "include",
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: 'Erro inesperado.'
    }));
    throw new Error(errorData.message || 'Erro inesperado.');
  }

  const text = await response.text();
  if (!text) return null;

  return JSON.parse(text);
}


export function createUser(data) {
  return request(`/auth/register`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
