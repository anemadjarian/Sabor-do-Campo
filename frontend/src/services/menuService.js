import { apiRequest } from './apiClient';

export function fetchCategories() {
  return apiRequest('/categories', { auth: false });
}

export function fetchMenuItems(category) {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiRequest(`/menu-items${query}`, { auth: false });
}

export function createMenuItem(payload) {
  return apiRequest('/menu-items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
