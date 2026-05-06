package com.sabordocampo.cart.dto;

import jakarta.validation.constraints.NotNull;

public record CartItemRequest(
    @NotNull(message = "MenuItemId é obrigatório") Long menuItemId
) {
}