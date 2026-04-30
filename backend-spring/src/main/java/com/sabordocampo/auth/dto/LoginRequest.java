package com.sabordocampo.auth.dto;

public record LoginRequest(
    String email,
    String password
) {}