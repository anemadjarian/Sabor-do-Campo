import { apiRequest } from './apiClient';

export function createUser(data) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    auth: false,
  });
}
