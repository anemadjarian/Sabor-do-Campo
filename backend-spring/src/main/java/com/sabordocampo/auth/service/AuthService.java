package com.sabordocampo.auth.service;

import com.sabordocampo.user.domain.Role;
import com.sabordocampo.user.domain.User;
import com.sabordocampo.user.repository.UserRepository;
import com.sabordocampo.auth.dto.LoginRequest;
import com.sabordocampo.auth.dto.LoginResponse;
import com.sabordocampo.auth.dto.RegisterRequest;
import com.sabordocampo.auth.dto.RegisterResponse;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public RegisterResponse register(RegisterRequest request) {
        Optional<User> requestedUser = userRepository.findByEmail(request.email());
        if(requestedUser.isPresent()) throw new RuntimeException("Email já cadastrado");
        User user = new User();
        user.setName(request.name());
        user.setCpf(request.cpf());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone());
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
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Senha inválida");
        }

        String token = jwtService.generateToken(user);
        LoginResponse response = new LoginResponse(
            user.getId(),
            user.getName(),
            user.getEmail(),
            token
        );

        return response;
    }
}