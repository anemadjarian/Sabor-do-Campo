package com.sabordocampo.user.config;

import com.sabordocampo.user.domain.Role;
import com.sabordocampo.user.domain.User;
import com.sabordocampo.user.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Configuration
public class UserDataInitializer {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedUser(UserRepository userRepository) {
        return args -> {
            Optional<User> existingUser = userRepository.findById(1L);
            if (existingUser.isEmpty()) {
                User user = new User();
                String name = "Usuário";
                String cpf = "00011122233";
                String email = "usuario@email.com";
                String phone = "3140028922";
                String password = passwordEncoder.encode("123");
                user.setName(name);
                user.setCpf(cpf);
                user.setEmail(email);
                user.setPassword(password);
                user.setPhone(phone);
                user.setRole(Role.ROLE_USER);
                userRepository.save(user);
            };
        };
    }
}