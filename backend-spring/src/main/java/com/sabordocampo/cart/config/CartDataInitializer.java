package com.sabordocampo.cart.config;

import com.sabordocampo.cart.domain.Address;
import com.sabordocampo.cart.domain.ShoppingCart;
import com.sabordocampo.cart.repository.ShoppingCartRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Optional;

@Configuration
public class CartDataInitializer {

    @Bean
    CommandLineRunner seedCart(ShoppingCartRepository shoppingCartRepository) {
        return args -> {
            Optional<ShoppingCart> existingCart = shoppingCartRepository.findById(1L);
            if (existingCart.isEmpty()) {
                ShoppingCart cart = new ShoppingCart();
                String street = "Rua Cláudio Manoel";
                String number = "1162";
                String neighborhood = "Savassi";
                String city = "Belo Horizonte";
                String state = "MG";
                String zipCode = "30140-100";
                String complement = "Prédio 04";
                Address address = new Address(street, number, neighborhood, city, state, zipCode, complement);
                cart.setAddress(address);
                shoppingCartRepository.save(cart);
            };
        };
    }
}