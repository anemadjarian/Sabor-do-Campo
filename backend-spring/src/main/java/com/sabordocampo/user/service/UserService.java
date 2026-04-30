package com.sabordocampo.user.service;

import com.sabordocampo.cart.domain.Address;
import com.sabordocampo.cart.dto.AddressResponse;
import com.sabordocampo.user.domain.Role;
import com.sabordocampo.user.domain.User;
import com.sabordocampo.user.dto.UserRequest;
import com.sabordocampo.user.dto.UserResponse;
import com.sabordocampo.user.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public UserResponse createUser(UserRequest request) {
        User user = new User();
        user.setName(request.name());
        user.setCpf(request.cpf());
        user.setEmail(request.email());
        String encodedPassword = passwordEncoder.encode(request.password());
        user.setPassword(encodedPassword);
        // user.setPassword(request.password());
        user.setPhone(request.phone());
        user.setRole(Role.ROLE_USER);
        userRepository.save(user);
        return toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(String email) {
        return userRepository.findByEmail(email)
            .map(this::toUserResponse)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    @Transactional
    public void removeUser(String email) {
        User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        userRepository.delete(user);
    }

    @Transactional
    public void updateUser(String email, UserRequest request) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        userRepository.save(user);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getCpf(),
            user.getEmail(),
            user.getPhone(),
            user.getRole(),
            toAddressResponse(user.getAddress())
        );
    }

    private AddressResponse toAddressResponse(Address address) {
        if (address == null) return null;

        return new AddressResponse(
            address.getStreet(),
            address.getNumber(),
            address.getNeighborhood(),
            address.getCity(),
            address.getState(),
            address.getZipCode(),
            address.getComplement()
        );
    }
}
