package com.sabordocampo.cart.repository;

import com.sabordocampo.cart.domain.CartItem;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByShoppingCartId(Long cartId);
}
