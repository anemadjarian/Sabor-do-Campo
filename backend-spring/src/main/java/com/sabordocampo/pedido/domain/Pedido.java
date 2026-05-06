package com.sabordocampo.pedido.domain;

import com.sabordocampo.cart.domain.Address;
import com.sabordocampo.user.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String codigo;

    @Column(nullable = false)
    private LocalDateTime criadoEm;

    @Embedded
    private Address enderecoEntrega;

    @Column
    private LocalDateTime entregueEm;

    @Enumerated(EnumType.STRING)
    @Column
    private PedidoStatus status = PedidoStatus.PEDIDO_FEITO;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoItem> itens = new ArrayList<>();

    protected Pedido() {
    }

    public Pedido(String codigo, LocalDateTime criadoEm, Address enderecoEntrega) {
        this.codigo = codigo;
        this.criadoEm = criadoEm;
        this.enderecoEntrega = enderecoEntrega;
    }

    public Long getId() {
        return id;
    }

    public String getCodigo() {
        return codigo;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public Address getEnderecoEntrega() {
        return enderecoEntrega;
    }

    public LocalDateTime getEntregueEm() {
        return entregueEm;
    }

    public PedidoStatus getStatus() {
        return status;
    }

    public void setStatus(PedidoStatus status) {
        this.status = status;
        if (status == PedidoStatus.PEDIDO_ENTREGUE && entregueEm == null) {
            entregueEm = LocalDateTime.now();
        }
        if (status != PedidoStatus.PEDIDO_ENTREGUE) {
            entregueEm = null;
        }
    }

    public List<PedidoItem> getItens() {
        return itens;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void adicionarItem(PedidoItem item) {
        itens.add(item);
    }

    public void confirmarEntrega(LocalDateTime entregueEm) {
        this.entregueEm = entregueEm;
        this.status = PedidoStatus.PEDIDO_ENTREGUE;
    }

    public BigDecimal getPrecoTotal() {
        return itens.stream()
            .map(PedidoItem::getPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
