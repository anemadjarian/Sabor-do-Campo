import { apiRequest } from './apiClient';

export async function login(data) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    auth: false,
  });
  localStorage.setItem('token', response.token);
  return response;
}
