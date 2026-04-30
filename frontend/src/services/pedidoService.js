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

export function confirmarPedido(cartId) {
  return request(`/carts/${cartId}/confirmar-pedido`, {
    method: 'POST',
  });
}

export function buscarStatusPedido(pedidoId) {
  return request(`/pedidos/${pedidoId}/status`);
}

export function confirmarEntregaPedido(pedidoId) {
  return request(`/pedidos/${pedidoId}/confirmar-entrega`, {
    method: 'POST',
  });
}
