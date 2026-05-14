import { apiRequest } from './apiClient';

export function fetchUsers() {
  return apiRequest('/users');
}

export function fetchUserById(id) {
  return apiRequest(`/users/${id}`);
}

export function deleteUserById(id) {
  return apiRequest(`/users/${id}`, {
    method: 'DELETE',
  });
}
