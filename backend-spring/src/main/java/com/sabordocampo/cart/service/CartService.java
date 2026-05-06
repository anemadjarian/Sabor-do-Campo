package com.sabordocampo.cart.service;

import com.sabordocampo.cart.domain.Address;
import com.sabordocampo.cart.domain.CartItem;
import com.sabordocampo.cart.domain.ShoppingCart;
import com.sabordocampo.menu.domain.MenuItem;
import com.sabordocampo.menu.repository.MenuItemRepository;
import com.sabordocampo.user.domain.User;
import com.sabordocampo.user.repository.UserRepository;
import com.sabordocampo.cart.dto.AddressResponse;
import com.sabordocampo.cart.dto.CartItemRequest;
import com.sabordocampo.cart.dto.CartItemResponse;
import com.sabordocampo.cart.dto.ShoppingCartResponse;
import com.sabordocampo.cart.repository.CartItemRepository;
import com.sabordocampo.cart.repository.ShoppingCartRepository;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartService {
    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final ShoppingCartRepository shoppingCartRepository;

    public CartService(CartItemRepository cartItemRepository, MenuItemRepository menuItemRepository,
        UserRepository userRepository, ShoppingCartRepository shoppingCartRepository) {
        this.cartItemRepository = cartItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.userRepository = userRepository;
        this.shoppingCartRepository = shoppingCartRepository;
    }

    @Transactional(readOnly = true)
    public ShoppingCart getCart(String email) {
        return shoppingCartRepository.findByUserEmail(email)
            .orElseGet(() -> {
                ShoppingCart cart = new ShoppingCart();
                User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
                cart.setUser(user);
                return shoppingCartRepository.save(cart);
            });
    }
    

    @Transactional(readOnly = true)
    public ShoppingCartResponse getMyCart(String email) {
        ShoppingCart cart = shoppingCartRepository.findByUserEmail(email)
            .orElseThrow(() -> new RuntimeException("Carrinho não encontrado"));

        return toShoppingCartResponse(cart);
    }

    @Transactional(readOnly = true)
    public List<CartItemResponse> listCartItems(String email) {  
        ShoppingCart cart = getCart(email);

        return cart.getItems().stream().map(this::toCartItemResponse).toList();
    }

    @Transactional
    public CartItemResponse createCartItem(String email, CartItemRequest request) {
        ShoppingCart shoppingCart = getCart(email);
        MenuItem menuItem = menuItemRepository.findById(request.menuItemId())
            .orElseThrow(() -> new RuntimeException("Item original do menu não encontrado"));
        CartItem cartItem = new CartItem(shoppingCart, menuItem);

        return toCartItemResponse(cartItemRepository.save(cartItem));
    }

    @Transactional
    public void removeCartItem(String email, Long itemId) {
        ShoppingCart cart = getCart(email);
        CartItem item = cartItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Item não encontrado"));
        if (!item.getShoppingCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Item não pertence ao carrinho");
        }
        cartItemRepository.delete(item);
    }

    @Transactional
    public void updateAddress(String email, Address address) {
        ShoppingCart cart = getCart(email);
        cart.setAddress(address);
        shoppingCartRepository.save(cart);
    }

    private ShoppingCartResponse toShoppingCartResponse(ShoppingCart cart) {

        List<CartItemResponse> items = cart.getItems().stream()
            .map(this::toCartItemResponse).toList();

        return new ShoppingCartResponse(
            cart.getId(),
            items,
            toAddressResponse(cart.getAddress())
        );
    }

    private CartItemResponse toCartItemResponse(CartItem cartItem) {

        return new CartItemResponse(
            cartItem.getId(),
            cartItem.getMenuItem().getId(),
            cartItem.getMenuItem().getName(),
            cartItem.getMenuItem().getPrice(),
            normalizeOptional(cartItem.getMenuItem().getImageUrl())
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

    private String normalizeOptional(String value) {
        return value == null ? "" : value.trim();
    }
}
