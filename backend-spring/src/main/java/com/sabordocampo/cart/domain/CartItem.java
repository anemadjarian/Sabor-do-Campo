package com.sabordocampo.cart.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sabordocampo.menu.domain.MenuItem;

@Entity
@Table(name = "cart_items")
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonIgnore
    @JoinColumn(name = "cart_id", nullable = false)
    private ShoppingCart shoppingCart;

    @ManyToOne
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    protected CartItem() {
    }

    public CartItem(ShoppingCart shoppingCart, MenuItem menuItem) {
        this.shoppingCart = shoppingCart;
        this.menuItem = menuItem;
    }

    public Long getId() {
        return id;
    }

    public ShoppingCart getShoppingCart() {
        return shoppingCart;
    }

    public MenuItem getMenuItem() {
        return menuItem;
    }

    public String getImageUrl() {
        return menuItem.getImageUrl();
    }

    public BigDecimal getPrice() {
        return menuItem.getPrice();
    }
}
