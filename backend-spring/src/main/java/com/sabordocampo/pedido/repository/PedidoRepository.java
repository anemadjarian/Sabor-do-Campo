package com.sabordocampo.pedido.repository;

import com.sabordocampo.pedido.domain.Pedido;
import com.sabordocampo.pedido.domain.PedidoStatus;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    boolean existsByCodigo(String codigo);
    boolean existsByUserEmailAndStatusNot(String email, PedidoStatus status);
    Optional<Pedido> findByIdAndUserEmail(Long id, String email);
    List<Pedido> findByUserEmail(String email);
    List<Pedido> findByUserEmailOrderByCriadoEmDesc(String email);
    List<Pedido> findByUserEmailAndStatusOrderByCriadoEmDesc(String email, PedidoStatus status);
    List<Pedido> findByUserEmailAndStatusNotOrderByCriadoEmDesc(String email, PedidoStatus status);
    List<Pedido> findAllByOrderByCriadoEmDesc();
}
