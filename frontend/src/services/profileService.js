import { apiRequest } from './apiClient';

export function getCurrentUser() {
  return apiRequest('/users/me');
}

export function updateUser(data) {
  return apiRequest('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
