package com.sabordocampo.auth.service;

import com.sabordocampo.user.domain.Role;
import com.sabordocampo.user.domain.User;
import com.sabordocampo.user.repository.UserRepository;
import com.sabordocampo.auth.dto.ForgotPasswordRequest;
import com.sabordocampo.auth.dto.LoginRequest;
import com.sabordocampo.auth.dto.LoginResponse;
import com.sabordocampo.auth.dto.MessageResponse;
import com.sabordocampo.auth.dto.RegisterRequest;
import com.sabordocampo.auth.dto.RegisterResponse;
import com.sabordocampo.auth.dto.ResetPasswordRequest;

import java.security.SecureRandom;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final long RESET_CODE_EXPIRATION_MILLIS = 10 * 60 * 1000;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public RegisterResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        String cpf = normalizeCpf(request.cpf());
        validatePassword(request.password());
        validateUniqueEmail(email);
        validateUniqueCpf(cpf);

        User user = new User();
        user.setName(normalizeRequired(request.name(), "Nome e obrigatorio"));
        user.setCpf(cpf);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(normalizePhone(request.phone()));
        user.setRole(Role.ROLE_USER);

        User registeredUser = userRepository.save(user);

        return new RegisterResponse(
            registeredUser.getId(),
            registeredUser.getName(),
            registeredUser.getCpf(),
            registeredUser.getEmail(),
            registeredUser.getPhone(),
            registeredUser.getRole(),
            null
        );
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
            .orElseThrow(() -> new RuntimeException("Usuario nao encontrado"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Senha invalida");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name(),
            token
        );
    }

    private void validateUniqueEmail(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email ja cadastrado");
        }
    }

    private void validateUniqueCpf(String cpf) {
        if (userRepository.findByCpf(cpf).isPresent()) {
            throw new RuntimeException("CPF ja cadastrado");
        }
    }

    private void validatePassword(String password) {
        if (password == null
            || password.length() < 8
            || !password.matches(".*[A-Z].*")
            || !password.matches(".*[a-z].*")
            || !password.matches(".*\\d.*")) {
            throw new RuntimeException("Senha deve ter no minimo 8 caracteres, com letra maiuscula, minuscula e numero");
        }
    }

    private String normalizeEmail(String email) {
        String value = normalizeRequired(email, "Email e obrigatorio").toLowerCase();
        if (!value.contains("@")) {
            throw new RuntimeException("Email invalido");
        }

        return value;
    }

    private String normalizeCpf(String cpf) {
        String digits = cpf == null ? "" : cpf.replaceAll("\\D", "");
        if (digits.length() != 11) {
            throw new RuntimeException("CPF deve ter 11 digitos");
        }

        return digits;
    }

    private String normalizePhone(String phone) {
        String digits = phone == null ? "" : phone.replaceAll("\\D", "");
        if (digits.length() != 10 && digits.length() != 11) {
            throw new RuntimeException("Telefone deve ter DDD e 10 ou 11 digitos");
        }

        return digits;
    }

    private String normalizeRequired(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new RuntimeException(message);
        }

        return value.trim();
    }

    public MessageResponse requestPasswordReset(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(normalizeEmail(request.email()))
            .orElseThrow(() -> new IllegalArgumentException("Nao existe conta para este email."));

        String resetCode = generateResetCode();
        long expiresAt = System.currentTimeMillis() + RESET_CODE_EXPIRATION_MILLIS;

        user.setPasswordResetCode(resetCode);
        user.setPasswordResetExpiresAt(expiresAt);
        userRepository.save(user);

        return new MessageResponse("Codigo gerado com sucesso.", resetCode);
    }

    public MessageResponse resetPassword(ResetPasswordRequest request) {
        validatePassword(request.newPassword());

        User user = userRepository.findByEmail(normalizeEmail(request.email()))
            .orElseThrow(() -> new IllegalArgumentException("Nao existe conta para este email."));

        if (user.getPasswordResetCode() == null || user.getPasswordResetExpiresAt() == null) {
            throw new IllegalArgumentException("Solicite um codigo de recuperacao antes de redefinir sua senha.");
        }

        if (System.currentTimeMillis() > user.getPasswordResetExpiresAt()) {
            clearResetCode(user);
            userRepository.save(user);
            throw new IllegalArgumentException("Codigo expirado. Solicite um novo codigo.");
        }

        if (!user.getPasswordResetCode().equals(request.code())) {
            throw new IllegalArgumentException("Codigo invalido.");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        clearResetCode(user);
        userRepository.save(user);

        return new MessageResponse("Senha redefinida com sucesso.", null);
    }

    private void clearResetCode(User user) {
        user.setPasswordResetCode(null);
        user.setPasswordResetExpiresAt(null);
    }

    private String generateResetCode() {
        int code = RANDOM.nextInt(900000) + 100000;
        return String.valueOf(code);
    }

}
