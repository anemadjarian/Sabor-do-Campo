import { apiRequest } from './apiClient';

export function fetchCart() {
  return apiRequest('/carts/me');
}

export function fetchCartItems(cartId) {
  return apiRequest('/carts/me/items');
}

export function createCartItem(menuItemId) {
  return apiRequest('/carts/me/items', {
    method: 'POST',
    body: JSON.stringify({ menuItemId }),
  });
}

export function removeCartItem(itemId) {
  return apiRequest(`/carts/me/items/${itemId}`, {
    method: 'DELETE',
  });
}

export function updateCartAddress(address) {
  return apiRequest('/carts/me/address', {
    method: 'PUT',
    body: JSON.stringify(address),
  });
}
