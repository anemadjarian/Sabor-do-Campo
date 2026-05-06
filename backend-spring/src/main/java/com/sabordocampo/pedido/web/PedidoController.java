package com.sabordocampo.pedido.web;

import com.sabordocampo.pedido.dto.PedidoResponse;
import com.sabordocampo.pedido.dto.PedidoStatusRequest;
import com.sabordocampo.pedido.dto.PedidoStatusResponse;
import com.sabordocampo.pedido.service.PedidoService;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
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
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping("/carts/{cartId}/confirmar-pedido")
    public PedidoResponse confirmarPedido(@PathVariable Long cartId, Authentication authentication) {
        return pedidoService.criarAPartirDoCarrinho(cartId, authentication.getName());
    }

    @GetMapping("/pedidos/{pedidoId}/status")
    public PedidoStatusResponse buscarStatus(@PathVariable Long pedidoId, Authentication authentication) {
        return pedidoService.buscarStatus(pedidoId, authentication.getName());
    }

    @PostMapping("/pedidos/{pedidoId}/confirmar-entrega")
    public PedidoStatusResponse confirmarEntrega(@PathVariable Long pedidoId, Authentication authentication) {
        return pedidoService.confirmarEntrega(pedidoId, authentication.getName());
    }

    @GetMapping("/pedidos/me")
    public List<PedidoResponse> listarMeusPedidos(Authentication authentication) {
        return pedidoService.listarMeusPedidos(authentication.getName());
    }

    @GetMapping("/pedidos/me/ativo")
    public PedidoResponse buscarPedidoAtivo(Authentication authentication) {
        return pedidoService.buscarPedidoAtivo(authentication.getName());
    }

    @GetMapping("/admin/pedidos")
    public List<PedidoResponse> listarPedidos() {
        return pedidoService.listarTodos();
    }

    @PutMapping("/admin/pedidos/{pedidoId}/status")
    public PedidoResponse atualizarStatus(@PathVariable Long pedidoId, @RequestBody PedidoStatusRequest request) {
        return pedidoService.atualizarStatus(pedidoId, request);
    }
}
