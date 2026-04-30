package com.sabordocampo.pedido.service;

import com.sabordocampo.cart.domain.Address;
import com.sabordocampo.cart.domain.CartItem;
import com.sabordocampo.cart.domain.ShoppingCart;
import com.sabordocampo.cart.dto.AddressResponse;
import com.sabordocampo.cart.repository.ShoppingCartRepository;
import com.sabordocampo.pedido.domain.Pedido;
import com.sabordocampo.pedido.domain.PedidoItem;
import com.sabordocampo.pedido.domain.PedidoStatus;
import com.sabordocampo.pedido.dto.PedidoItemResponse;
import com.sabordocampo.pedido.dto.PedidoResponse;
import com.sabordocampo.pedido.dto.PedidoStatusResponse;
import com.sabordocampo.pedido.repository.PedidoRepository;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoService {

    private final ShoppingCartRepository shoppingCartRepository;
    private final PedidoRepository pedidoRepository;

    public PedidoService(ShoppingCartRepository shoppingCartRepository, PedidoRepository pedidoRepository) {
        this.shoppingCartRepository = shoppingCartRepository;
        this.pedidoRepository = pedidoRepository;
    }

    @Transactional
    public PedidoResponse criarAPartirDoCarrinho(Long cartId, String email) {
        ShoppingCart carrinho = shoppingCartRepository.findById(cartId)
            .orElseThrow(() -> new IllegalArgumentException("Carrinho nao encontrado."));

        if (carrinho.getUser() == null || !email.equals(carrinho.getUser().getEmail())) {
            throw new IllegalArgumentException("Carrinho nao pertence ao usuario autenticado.");
        }

        if (carrinho.getItems().isEmpty()) {
            throw new IllegalArgumentException("Carrinho vazio. Adicione itens antes de confirmar.");
        }

        if (carrinho.getAddress() == null) {
            throw new IllegalArgumentException("Informe o endereco de entrega antes de confirmar.");
        }

        Pedido pedido = new Pedido(
            gerarCodigoUnicoPedido(),
            LocalDateTime.now(),
            copiarEndereco(carrinho.getAddress())
        );
        pedido.setUser(carrinho.getUser());

        for (CartItem cartItem : carrinho.getItems()) {
            PedidoItem pedidoItem = new PedidoItem(
                pedido,
                cartItem.getMenuItem().getId(),
                cartItem.getMenuItem().getName(),
                cartItem.getMenuItem().getPrice(),
                normalizarOpcional(cartItem.getMenuItem().getImageUrl())
            );
            pedido.adicionarItem(pedidoItem);
        }

        Pedido savedPedido = pedidoRepository.save(pedido);
        carrinho.getItems().clear();

        return toPedidoResponse(savedPedido);
    }

    @Transactional(readOnly = true)
    public PedidoStatusResponse buscarStatus(Long pedidoId, String email) {
        Pedido pedido = pedidoRepository.findByIdAndUserEmail(pedidoId, email)
            .orElseThrow(() -> new IllegalArgumentException("Pedido nao encontrado."));

        return new PedidoStatusResponse(
            pedido.getId(),
            pedido.getCodigo(),
            calcularStatus(pedido)
        );
    }

    @Transactional
    public PedidoStatusResponse confirmarEntrega(Long pedidoId, String email) {
        Pedido pedido = pedidoRepository.findByIdAndUserEmail(pedidoId, email)
            .orElseThrow(() -> new IllegalArgumentException("Pedido nao encontrado."));

        pedido.confirmarEntrega(LocalDateTime.now());

        return new PedidoStatusResponse(
            pedido.getId(),
            pedido.getCodigo(),
            PedidoStatus.PEDIDO_ENTREGUE
        );
    }

    private PedidoStatus calcularStatus(Pedido pedido) {
        if (pedido.getEntregueEm() != null) {
            return PedidoStatus.PEDIDO_ENTREGUE;
        }

        long minutos = Duration.between(pedido.getCriadoEm(), LocalDateTime.now()).toMinutes();

        if (minutos < 1) {
            return PedidoStatus.PEDIDO_FEITO;
        }
        if (minutos < 2) {
            return PedidoStatus.PEDIDO_EM_PREPARO;
        }
        return PedidoStatus.PEDIDO_EM_ROTA_DE_ENTREGA;
    }

    private PedidoResponse toPedidoResponse(Pedido pedido) {
        List<PedidoItemResponse> itens = pedido.getItens().stream()
            .map(this::toPedidoItemResponse)
            .toList();

        return new PedidoResponse(
            pedido.getId(),
            pedido.getCodigo(),
            pedido.getCriadoEm(),
            calcularStatus(pedido),
            itens,
            toAddressResponse(pedido.getEnderecoEntrega()),
            pedido.getPrecoTotal()
        );
    }

    private PedidoItemResponse toPedidoItemResponse(PedidoItem item) {
        return new PedidoItemResponse(
            item.getId(),
            item.getMenuItemId(),
            item.getNome(),
            item.getPrice(),
            normalizarOpcional(item.getImageUrl())
        );
    }

    private AddressResponse toAddressResponse(Address address) {
        if (address == null) {
            return null;
        }

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

    private Address copiarEndereco(Address address) {
        return new Address(
            address.getStreet(),
            address.getNumber(),
            address.getNeighborhood(),
            address.getCity(),
            address.getState(),
            address.getZipCode(),
            address.getComplement()
        );
    }

    private String gerarCodigoUnicoPedido() {
        String codigo;
        do {
            codigo = "PED-" + UUID.randomUUID().toString().replace("-", "")
                .substring(0, 8)
                .toUpperCase(Locale.ROOT);
        } while (pedidoRepository.existsByCodigo(codigo));

        return codigo;
    }

    private String normalizarOpcional(String value) {
        return value == null ? "" : value.trim();
    }
}
