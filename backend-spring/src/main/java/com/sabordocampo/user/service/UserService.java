package com.sabordocampo.user.service;

import com.sabordocampo.cart.domain.Address;
import com.sabordocampo.cart.domain.ShoppingCart;
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
        String email = normalizeEmail(request.email());
        String cpf = normalizeCpf(request.cpf());
        validatePassword(request.password(), true);
        validateUniqueEmail(email, null);
        validateUniqueCpf(cpf, null);

        User user = new User();
        user.setName(normalizeRequired(request.name(), "Nome e obrigatorio"));
        user.setCpf(cpf);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setPhone(normalizePhone(request.phone()));
        user.setRole(Role.ROLE_USER);
        ShoppingCart cart = new ShoppingCart();
        cart.setUser(user);
        user.setCart(cart);
        userRepository.save(user);
        return toUserResponse(user, true);
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(String email) {
        return userRepository.findByEmail(email)
            .map(user -> toUserResponse(user, true))
            .orElseThrow(() -> new RuntimeException("Usuario nao encontrado"));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
            .map(user -> toUserResponse(user, false))
            .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return userRepository.findById(id)
            .map(user -> toUserResponse(user, false))
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
        String nextEmail = normalizeEmail(request.email());
        String nextCpf = normalizeCpf(request.cpf());
        validateUniqueEmail(nextEmail, user.getId());
        validateUniqueCpf(nextCpf, user.getId());
        validatePassword(request.password(), false);

        user.setName(normalizeRequired(request.name(), "Nome e obrigatorio"));
        user.setCpf(nextCpf);
        user.setEmail(nextEmail);
        user.setPhone(normalizePhone(request.phone()));
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        userRepository.save(user);
    }

    private UserResponse toUserResponse(User user, boolean includeCpf) {
        return new UserResponse(
            user.getId(),
            user.getName(),
            includeCpf ? user.getCpf() : null,
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

    private void validateUniqueEmail(String email, Long currentUserId) {
        userRepository.findByEmail(email)
            .filter(existing -> !existing.getId().equals(currentUserId))
            .ifPresent(existing -> {
                throw new RuntimeException("Email ja cadastrado");
            });
    }

    private void validateUniqueCpf(String cpf, Long currentUserId) {
        userRepository.findByCpf(cpf)
            .filter(existing -> !existing.getId().equals(currentUserId))
            .ifPresent(existing -> {
                throw new RuntimeException("CPF ja cadastrado");
            });
    }

    private void validatePassword(String password, boolean required) {
        if (!required && (password == null || password.isBlank())) {
            return;
        }

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
