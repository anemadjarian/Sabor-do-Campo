package com.sabordocampo.cart.web;

import com.sabordocampo.cart.domain.Address;
import com.sabordocampo.cart.dto.CartItemRequest;
import com.sabordocampo.cart.dto.CartItemResponse;
import com.sabordocampo.cart.dto.ShoppingCartResponse;
import com.sabordocampo.cart.service.CartService;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/carts/me")
    public ShoppingCartResponse getCart(Authentication authentication) {
        String email = authentication.getName();
        return cartService.getMyCart(email);
    }

    @GetMapping("/carts/{cartId}/items")
    public List<CartItemResponse> listCartItems(Authentication authentication) {
        return cartService.listCartItems(authentication.getName());
    }

    @PostMapping("/carts/me/items")
    public CartItemResponse createCartItem(Authentication authentication, @RequestBody CartItemRequest request) {
        return cartService.createCartItem(authentication.getName(), request);
    }

    @DeleteMapping("carts/me/items/{itemId}")
    public void removeCartItem(Authentication authentication, @PathVariable Long itemId) {
        cartService.removeCartItem(authentication.getName(), itemId);
    }

    @PutMapping("/carts/me/address")
    public void updateAddress(Authentication authentication, @RequestBody Address address) {
        cartService.updateAddress(authentication.getName(), address);
    }
}
