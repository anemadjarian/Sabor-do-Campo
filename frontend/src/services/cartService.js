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

export function fetchCart() {
  return request(`/carts/me`);
}

export function fetchCartItems(cartId) {
  return request(`/carts/me/items`);
}

export function createCartItem(menuItemId) {
  return request(`/carts/me/items`, {
    method: 'POST',
    body: JSON.stringify({ menuItemId }),
  });
}

export function removeCartItem(itemId) {
  return request(`/carts/me/items/${itemId}`, {
    method: 'DELETE',
  });
}

export function updateCartAddress(address) {
  return request(`/carts/me/address`, {
    method: 'PUT',
    body: JSON.stringify(address),
  });
}
