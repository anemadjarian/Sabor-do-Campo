package com.sabordocampo.pedido.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "pedido_itens")
public class PedidoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Column(nullable = false)
    private Long menuItemId;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private BigDecimal preco;

    private String imageUrl;

    protected PedidoItem() {
    }

    public PedidoItem(Pedido pedido, Long menuItemId, String nome, BigDecimal preco, String imageUrl) {
        this.pedido = pedido;
        this.menuItemId = menuItemId;
        this.nome = nome;
        this.preco = preco;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public Long getMenuItemId() {
        return menuItemId;
    }

    public String getNome() {
        return nome;
    }

    public BigDecimal getPrice() {
        return preco;
    }

    public String getImageUrl() {
        return imageUrl;
    }
}
