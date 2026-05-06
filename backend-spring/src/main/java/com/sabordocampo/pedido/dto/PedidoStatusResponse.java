package com.sabordocampo.pedido.dto;

import com.sabordocampo.pedido.domain.PedidoStatus;

public record PedidoStatusResponse(
    Long pedidoId,
    String codigo,
    PedidoStatus status
) {
}
