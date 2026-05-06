package com.sabordocampo.auth.dto;

public record RegisterRequest(
    String name,
    String cpf,
    String email,
    String password,
    String phone
){}
