package com.sabordocampo.pedido.dto;

import com.sabordocampo.cart.dto.AddressResponse;
import com.sabordocampo.pedido.domain.PedidoStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(
    Long id,
    String codigo,
    LocalDateTime criadoEm,
    PedidoStatus status,
    List<PedidoItemResponse> itens,
    AddressResponse enderecoEntrega,
    BigDecimal precoTotal
) {
}
