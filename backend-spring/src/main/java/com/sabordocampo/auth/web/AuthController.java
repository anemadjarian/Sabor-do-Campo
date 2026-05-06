package com.sabordocampo.auth.web;

import com.sabordocampo.auth.dto.ForgotPasswordRequest;
import com.sabordocampo.auth.dto.LoginRequest;
import com.sabordocampo.auth.dto.LoginResponse;
import com.sabordocampo.auth.dto.MessageResponse;
import com.sabordocampo.auth.dto.RegisterRequest;
import com.sabordocampo.auth.dto.RegisterResponse;
import com.sabordocampo.auth.dto.ResetPasswordRequest;
import com.sabordocampo.auth.service.AuthService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public RegisterResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.requestPasswordReset(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }
}
