package com.sabordocampo.auth.dto;

public record LoginResponse(
    Long id,
    String name,
    String email,
    String token
) {}