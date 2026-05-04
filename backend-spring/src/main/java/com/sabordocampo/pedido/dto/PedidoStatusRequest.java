package com.sabordocampo.pedido.dto;

import com.sabordocampo.pedido.domain.PedidoStatus;

public record PedidoStatusRequest(
    PedidoStatus status
) {
}
