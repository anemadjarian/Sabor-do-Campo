package com.sabordocampo.cart.repository;

import com.sabordocampo.cart.domain.ShoppingCart;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ShoppingCartRepository extends JpaRepository<ShoppingCart, Long> {
    Optional<ShoppingCart> findByUserEmail(String email);
}
