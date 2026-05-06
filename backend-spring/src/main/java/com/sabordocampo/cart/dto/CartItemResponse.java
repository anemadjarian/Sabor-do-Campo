package com.sabordocampo.cart.dto;

import java.math.BigDecimal;

public record CartItemResponse(
    Long id,
    Long menuItemId,
    String name,
    BigDecimal price,
    String imageUrl
) {
}
