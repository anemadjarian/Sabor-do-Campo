package com.sabordocampo.user.dto;

public record UserRequest(
    String name,
    String cpf,
    String email,
    String password,
    String phone
) {}
