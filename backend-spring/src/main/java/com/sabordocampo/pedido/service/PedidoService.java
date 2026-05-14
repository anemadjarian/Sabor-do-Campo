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
import com.sabordocampo.pedido.dto.PedidoStatusRequest;
import com.sabordocampo.pedido.dto.PedidoStatusResponse;
import com.sabordocampo.pedido.repository.PedidoRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoService {

    private final ShoppingCartRepository shoppingCartRepository;
    private final PedidoRepository pedidoRepository;
    private final FreteService freteService;

    public PedidoService(
        ShoppingCartRepository shoppingCartRepository,
        PedidoRepository pedidoRepository,
        FreteService freteService
    ) {
        this.shoppingCartRepository = shoppingCartRepository;
        this.pedidoRepository = pedidoRepository;
        this.freteService = freteService;
    }

    @Transactional
    public PedidoResponse criarAPartirDoCarrinho(Long cartId, String email) {
        if (pedidoRepository.existsByUserEmailAndStatusNot(email, PedidoStatus.PEDIDO_ENTREGUE)) {
            throw new IllegalStateException(
                "Voce ja possui um pedido em andamento."
            );
        }

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
        pedido.setStatus(PedidoStatus.PEDIDO_FEITO);
        FreteService.Frete frete = freteService.calcular(carrinho.getAddress());
        pedido.setFrete(frete.valor());
        pedido.setDistanciaEntregaKm(frete.distanciaKm());

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

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarMeusPedidos(String email) {
        return pedidoRepository.findByUserEmailAndStatusOrderByCriadoEmDesc(email, PedidoStatus.PEDIDO_ENTREGUE).stream()
            .map(this::toPedidoResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public PedidoResponse buscarPedidoAtivo(String email) {
        return pedidoRepository.findByUserEmailAndStatusNotOrderByCriadoEmDesc(email, PedidoStatus.PEDIDO_ENTREGUE).stream()
            //.filter(pedido -> calcularStatus(pedido) != PedidoStatus.PEDIDO_ENTREGUE)
            .findFirst()
            .map(this::toPedidoResponse)
            .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarTodos() {
        return pedidoRepository.findAllByOrderByCriadoEmDesc().stream()
            .map(this::toPedidoResponse)
            .toList();
    }

    @Transactional
    public PedidoResponse atualizarStatus(Long pedidoId, PedidoStatusRequest request) {
        if (request.status() == null) {
            throw new IllegalArgumentException("Status e obrigatorio.");
        }

        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new IllegalArgumentException("Pedido nao encontrado."));

        pedido.setStatus(request.status());
        return toPedidoResponse(pedido);
    }

    private PedidoStatus calcularStatus(Pedido pedido) {
        if (pedido.getStatus() != null) {
            return pedido.getStatus();
        }

        if (pedido.getEntregueEm() != null) {
            return PedidoStatus.PEDIDO_ENTREGUE;
        }

        return PedidoStatus.PEDIDO_FEITO;
    }

    private PedidoResponse toPedidoResponse(Pedido pedido) {
        List<PedidoItemResponse> itens = pedido.getItens().stream()
            .map(this::toPedidoItemResponse)
            .toList();
        BigDecimal subtotalProdutos = pedido.getSubtotalProdutos();
        FreteService.Frete frete = freteDoPedido(pedido);
        BigDecimal valorFrete = frete.valor() == null ? BigDecimal.ZERO : frete.valor();

        return new PedidoResponse(
            pedido.getId(),
            pedido.getCodigo(),
            pedido.getCriadoEm(),
            calcularStatus(pedido),
            itens,
            toAddressResponse(pedido.getEnderecoEntrega()),
            subtotalProdutos,
            valorFrete,
            frete.distanciaKm(),
            subtotalProdutos.add(valorFrete),
            pedido.getUser() == null ? null : pedido.getUser().getId(),
            pedido.getUser() == null ? "Usuario removido" : pedido.getUser().getName(),
            pedido.getUser() == null ? "" : pedido.getUser().getEmail()
        );
    }

    private FreteService.Frete freteDoPedido(Pedido pedido) {
        if (pedido.getDistanciaEntregaKm() == null && temCep(pedido.getEnderecoEntrega())) {
            return freteService.calcular(pedido.getEnderecoEntrega());
        }

        return new FreteService.Frete(pedido.getFrete(), pedido.getDistanciaEntregaKm());
    }

    private boolean temCep(Address address) {
        return address != null && address.getZipCode() != null && !address.getZipCode().isBlank();
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
