package com.sabordocampo.pedido.dto;

import java.math.BigDecimal;

public record PedidoItemResponse(
    Long id,
    Long menuItemId,
    String nome,
    BigDecimal preco,
    String imageUrl
) {
}
