import { apiRequest } from './apiClient';

export function fetchAdminPedidos() {
  return apiRequest('/admin/pedidos');
}

export function updatePedidoStatus(pedidoId, status) {
  return apiRequest(`/admin/pedidos/${pedidoId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}
