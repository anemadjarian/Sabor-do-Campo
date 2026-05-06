package com.sabordocampo.user.dto;

import com.sabordocampo.cart.dto.AddressResponse;
import com.sabordocampo.user.domain.Role;

public record UserResponse(
    Long id,
    String name,
    String cpf,
    String email,
    String phone,
    Role role,
    AddressResponse address
) {
}
