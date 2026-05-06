import { apiRequest } from './apiClient';

export function confirmarPedido(cartId) {
  return apiRequest(`/carts/${cartId}/confirmar-pedido`, {
    method: 'POST',
  });
}

export function buscarStatusPedido(pedidoId) {
  return apiRequest(`/pedidos/${pedidoId}/status`);
}

export function buscarPedidoAtivo() {
  return apiRequest('/pedidos/me/ativo');
}

export function confirmarEntregaPedido(pedidoId) {
  return apiRequest(`/pedidos/${pedidoId}/confirmar-entrega`, {
    method: 'POST',
  });
}
