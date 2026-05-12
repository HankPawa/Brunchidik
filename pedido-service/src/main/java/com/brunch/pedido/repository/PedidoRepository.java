package com.brunch.pedido.repository;

import com.brunch.pedido.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);
}
