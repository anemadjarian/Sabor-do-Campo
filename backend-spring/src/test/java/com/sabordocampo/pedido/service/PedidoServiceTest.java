package com.sabordocampo.pedido.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sabordocampo.cart.domain.Address;
import com.sabordocampo.cart.domain.CartItem;
import com.sabordocampo.cart.domain.ShoppingCart;
import com.sabordocampo.cart.repository.ShoppingCartRepository;
import com.sabordocampo.menu.domain.Category;
import com.sabordocampo.menu.domain.MenuItem;
import com.sabordocampo.pedido.domain.Pedido;
import com.sabordocampo.pedido.domain.PedidoStatus;
import com.sabordocampo.pedido.dto.PedidoResponse;
import com.sabordocampo.pedido.dto.PedidoStatusRequest;
import com.sabordocampo.pedido.dto.PedidoStatusResponse;
import com.sabordocampo.pedido.repository.PedidoRepository;
import com.sabordocampo.user.domain.Role;
import com.sabordocampo.user.domain.User;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock
    private ShoppingCartRepository shoppingCartRepository;

    @Mock
    private PedidoRepository pedidoRepository;

    @InjectMocks
    private PedidoService pedidoService;

    @Test
    void criarAPartirDoCarrinhoDeveCriarPedidoEEsvaziarCarrinho() {
        ShoppingCart carrinho = new ShoppingCart();
        carrinho.setUser(user("cliente@sabor.com"));
        carrinho.setAddress(new Address("Rua A", "10", "Centro", "Cidade", "SP", "12345-678", "Apto 1"));

        MenuItem prato = new MenuItem("Prato Executivo", "Desc", new BigDecimal("25.00"), Category.PRATO_PRINCIPAL, "Ingredientes", "  https://img/prato.jpg  ");
        ReflectionTestUtils.setField(prato, "id", 11L);

        MenuItem bebida = new MenuItem("Suco", "Desc", new BigDecimal("7.50"), Category.BEBIDA, "Ingredientes", null);
        ReflectionTestUtils.setField(bebida, "id", 12L);

        carrinho.getItems().add(new CartItem(carrinho, prato));
        carrinho.getItems().add(new CartItem(carrinho, bebida));

        when(shoppingCartRepository.findById(1L)).thenReturn(Optional.of(carrinho));
        when(pedidoRepository.existsByCodigo(any())).thenReturn(false);
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PedidoResponse response = pedidoService.criarAPartirDoCarrinho(1L, "cliente@sabor.com");

        assertThat(response.codigo()).startsWith("PED-");
        assertThat(response.status()).isEqualTo(PedidoStatus.PEDIDO_FEITO);
        assertThat(response.itens()).hasSize(2);
        assertThat(response.itens().get(0).imageUrl()).isEqualTo("https://img/prato.jpg");
        assertThat(response.itens().get(1).imageUrl()).isEqualTo("");
        assertThat(response.precoTotal()).isEqualByComparingTo("32.50");

        ArgumentCaptor<Pedido> pedidoCaptor = ArgumentCaptor.forClass(Pedido.class);
        verify(pedidoRepository).save(pedidoCaptor.capture());
        Pedido pedidoSalvo = pedidoCaptor.getValue();
        assertThat(pedidoSalvo.getEnderecoEntrega()).isNotNull();
        assertThat(pedidoSalvo.getEnderecoEntrega()).isNotSameAs(carrinho.getAddress());
        assertThat(pedidoSalvo.getEnderecoEntrega().getStreet()).isEqualTo("Rua A");
        assertThat(pedidoSalvo.getUser()).isNotNull();
        assertThat(pedidoSalvo.getUser().getEmail()).isEqualTo("cliente@sabor.com");

        assertThat(carrinho.getItems()).isEmpty();
    }

    @Test
    void criarAPartirDoCarrinhoDeveFalharQuandoCarrinhoVazio() {
        ShoppingCart carrinho = new ShoppingCart();
        carrinho.setUser(user("cliente@sabor.com"));
        carrinho.setAddress(new Address("Rua A", "10", "Centro", "Cidade", "SP", "12345-678", null));
        when(shoppingCartRepository.findById(1L)).thenReturn(Optional.of(carrinho));

        assertThatThrownBy(() -> pedidoService.criarAPartirDoCarrinho(1L, "cliente@sabor.com"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Carrinho vazio. Adicione itens antes de confirmar.");
    }

    @Test
    void criarAPartirDoCarrinhoDeveFalharQuandoEnderecoNaoInformado() {
        ShoppingCart carrinho = new ShoppingCart();
        carrinho.setUser(user("cliente@sabor.com"));
        MenuItem prato = new MenuItem("Prato", "Desc", new BigDecimal("10.00"), Category.PRATO_PRINCIPAL, "Ingredientes", "img");
        carrinho.getItems().add(new CartItem(carrinho, prato));
        when(shoppingCartRepository.findById(1L)).thenReturn(Optional.of(carrinho));

        assertThatThrownBy(() -> pedidoService.criarAPartirDoCarrinho(1L, "cliente@sabor.com"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Informe o endereco de entrega antes de confirmar.");
    }

    @Test
    void criarAPartirDoCarrinhoDeveFalharQuandoCarrinhoPertenceAOutroUsuario() {
        ShoppingCart carrinho = new ShoppingCart();
        carrinho.setUser(user("outro@sabor.com"));
        carrinho.setAddress(new Address("Rua A", "10", "Centro", "Cidade", "SP", "12345-678", null));

        MenuItem prato = new MenuItem("Prato", "Desc", new BigDecimal("10.00"), Category.PRATO_PRINCIPAL, "Ingredientes", "img");
        carrinho.getItems().add(new CartItem(carrinho, prato));

        when(shoppingCartRepository.findById(1L)).thenReturn(Optional.of(carrinho));

        assertThatThrownBy(() -> pedidoService.criarAPartirDoCarrinho(1L, "cliente@sabor.com"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Carrinho nao pertence ao usuario autenticado.");
    }

    @Test
    void buscarStatusDeveRetornarPedidoFeitoQuandoMenosDeUmMinuto() {
        Pedido pedido = new Pedido("PED-AAAA1111", LocalDateTime.now().minusSeconds(30), endereco());
        when(pedidoRepository.findByIdAndUserEmail(10L, "cliente@sabor.com")).thenReturn(Optional.of(pedido));

        PedidoStatusResponse response = pedidoService.buscarStatus(10L, "cliente@sabor.com");

        assertThat(response.status()).isEqualTo(PedidoStatus.PEDIDO_FEITO);
    }

    @Test
    void buscarStatusDeveRetornarStatusPersistidoEmPreparo() {
        Pedido pedido = new Pedido("PED-BBBB2222", LocalDateTime.now().minusSeconds(90), endereco());
        pedido.setStatus(PedidoStatus.PEDIDO_EM_PREPARO);
        when(pedidoRepository.findByIdAndUserEmail(20L, "cliente@sabor.com")).thenReturn(Optional.of(pedido));

        PedidoStatusResponse response = pedidoService.buscarStatus(20L, "cliente@sabor.com");

        assertThat(response.status()).isEqualTo(PedidoStatus.PEDIDO_EM_PREPARO);
    }

    @Test
    void buscarStatusDeveRetornarStatusPersistidoEmRota() {
        Pedido pedido = new Pedido("PED-CCCC3333", LocalDateTime.now().minusMinutes(3), endereco());
        pedido.setStatus(PedidoStatus.PEDIDO_EM_ROTA_DE_ENTREGA);
        when(pedidoRepository.findByIdAndUserEmail(30L, "cliente@sabor.com")).thenReturn(Optional.of(pedido));

        PedidoStatusResponse response = pedidoService.buscarStatus(30L, "cliente@sabor.com");

        assertThat(response.status()).isEqualTo(PedidoStatus.PEDIDO_EM_ROTA_DE_ENTREGA);
    }

    @Test
    void confirmarEntregaDeveAtualizarStatusParaEntregue() {
        Pedido pedido = new Pedido("PED-DDDD4444", LocalDateTime.now().minusMinutes(1), endereco());
        when(pedidoRepository.findByIdAndUserEmail(40L, "cliente@sabor.com")).thenReturn(Optional.of(pedido));

        PedidoStatusResponse response = pedidoService.confirmarEntrega(40L, "cliente@sabor.com");

        assertThat(response.status()).isEqualTo(PedidoStatus.PEDIDO_ENTREGUE);
        assertThat(pedido.getEntregueEm()).isNotNull();
    }

    @Test
    void atualizarStatusDevePermitirAdminAlterarPedido() {
        Pedido pedido = new Pedido("PED-EEEE5555", LocalDateTime.now(), endereco());
        when(pedidoRepository.findById(50L)).thenReturn(Optional.of(pedido));

        PedidoResponse response = pedidoService.atualizarStatus(
            50L,
            new PedidoStatusRequest(PedidoStatus.PEDIDO_EM_ROTA_DE_ENTREGA)
        );

        assertThat(response.status()).isEqualTo(PedidoStatus.PEDIDO_EM_ROTA_DE_ENTREGA);
        assertThat(pedido.getStatus()).isEqualTo(PedidoStatus.PEDIDO_EM_ROTA_DE_ENTREGA);
    }

    private Address endereco() {
        return new Address("Rua A", "10", "Centro", "Cidade", "SP", "12345-678", null);
    }

    private User user(String email) {
        User user = new User();
        user.setEmail(email);
        user.setRole(Role.ROLE_USER);
        return user;
    }
}
