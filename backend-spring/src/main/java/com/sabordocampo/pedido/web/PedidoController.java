package com.sabordocampo.pedido.web;

import com.sabordocampo.pedido.dto.PedidoResponse;
import com.sabordocampo.pedido.dto.PedidoStatusResponse;
import com.sabordocampo.pedido.service.PedidoService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
}
