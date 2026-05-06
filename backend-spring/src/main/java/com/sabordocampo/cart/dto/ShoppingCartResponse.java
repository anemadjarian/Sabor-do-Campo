package com.sabordocampo.cart.dto;

import java.util.List;

public record ShoppingCartResponse(
    Long id,
    List<CartItemResponse> items,
    AddressResponse address
) {
}
