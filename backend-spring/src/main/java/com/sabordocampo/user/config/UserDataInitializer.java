package com.sabordocampo.user.config;

import com.sabordocampo.user.domain.Role;
import com.sabordocampo.user.domain.User;
import com.sabordocampo.user.repository.UserRepository;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class UserDataInitializer {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@sabordocampo.com}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Bean
    CommandLineRunner seedUser(UserRepository userRepository) {
        return args -> {
            Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);
            if (existingAdmin.isEmpty()) {
                User admin = new User();
                admin.setName("Administrador");
                admin.setCpf("99988877766");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setPhone("31999999999");
                admin.setRole(Role.ROLE_ADMIN);
                userRepository.save(admin);
            } else {
                User admin = existingAdmin.get();
                admin.setName("Administrador");
                admin.setRole(Role.ROLE_ADMIN);
                userRepository.save(admin);
            }

            Optional<User> existingUser = userRepository.findByEmail("usuario@email.com");
            if (existingUser.isEmpty()) {
                User user = new User();
                user.setName("Usuario");
                user.setCpf("00011122233");
                user.setEmail("usuario@email.com");
                user.setPassword(passwordEncoder.encode("123"));
                user.setPhone("3140028922");
                user.setRole(Role.ROLE_USER);
                userRepository.save(user);
            }
        };
    }
}
