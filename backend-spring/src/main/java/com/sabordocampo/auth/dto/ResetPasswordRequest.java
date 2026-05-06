package com.sabordocampo.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank(message = "Email e obrigatorio.")
    @Email(message = "Email invalido.")
    String email,

    @NotBlank(message = "Codigo e obrigatorio.")
    @Size(min = 6, max = 6, message = "Codigo deve ter 6 digitos.")
    String code,

    @NotBlank(message = "Nova senha e obrigatoria.")
    @Size(min = 6, message = "Nova senha deve ter no minimo 6 caracteres.")
    String newPassword
) {}

