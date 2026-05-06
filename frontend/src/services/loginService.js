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

export async function requestPasswordReset(email) {
  return apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
    auth: false,
  });
}

export async function resetPassword(data) {
  return apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
    auth: false,
  });
}
