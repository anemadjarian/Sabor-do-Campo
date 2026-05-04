package com.sabordocampo.user.service;

import com.sabordocampo.cart.domain.Address;
import com.sabordocampo.cart.dto.AddressResponse;
import com.sabordocampo.pedido.repository.PedidoRepository;
import com.sabordocampo.user.domain.Role;
import com.sabordocampo.user.domain.User;
import com.sabordocampo.user.dto.UserRequest;
import com.sabordocampo.user.dto.UserResponse;
import com.sabordocampo.user.repository.UserRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PedidoRepository pedidoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@sabordocampo.com}")
    private String fixedAdminEmail;

    public UserService(UserRepository userRepository, PedidoRepository pedidoRepository) {
        this.userRepository = userRepository;
        this.pedidoRepository = pedidoRepository;
    }

    @Transactional
    public UserResponse createUser(UserRequest request) {
        User user = new User();
        user.setName(request.name());
        user.setCpf(request.cpf());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone());
        user.setRole(Role.ROLE_USER);
        userRepository.save(user);
        return toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(String email) {
        return userRepository.findByEmail(email)
            .map(this::toUserResponse)
            .orElseThrow(() -> new RuntimeException("Usuario nao encontrado"));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
            .map(this::toUserResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return userRepository.findById(id)
            .map(this::toUserResponse)
            .orElseThrow(() -> new RuntimeException("Usuario nao encontrado"));
    }

    @Transactional
    public void removeUser(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario nao encontrado"));
        validateCanRemove(user);
        detachPedidos(user);
        userRepository.delete(user);
    }

    @Transactional
    public void removeUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario nao encontrado"));

        validateCanRemove(user);
        detachPedidos(user);
        userRepository.delete(user);
    }

    @Transactional
    public void updateUser(String email, UserRequest request) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario nao encontrado"));
        user.setName(request.name());
        user.setCpf(request.cpf());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
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

    private void detachPedidos(User user) {
        pedidoRepository.findByUserEmail(user.getEmail()).forEach(pedido -> pedido.setUser(null));
    }

    private void validateCanRemove(User user) {
        if (fixedAdminEmail.equalsIgnoreCase(user.getEmail())) {
            throw new RuntimeException("O administrador fixo nao pode ser removido");
        }
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
