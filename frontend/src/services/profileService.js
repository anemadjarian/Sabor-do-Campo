const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers ?? {})
    },
    ...options
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    console.error("Backend error:", data);
    throw new Error(data?.message || "Erro ao processar usuário");
  }

  return data;
}

export function getCurrentUser() {
  return request("/users/me");
}

export function updateUser(data) {
  return request("/users/me", {
    method: "PUT",
    body: JSON.stringify(data)
  });
}