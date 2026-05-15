package com.brunch.pedido.controller;

import com.brunch.pedido.model.Pedido;
import com.brunch.pedido.repository.PedidoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/pedidos")
public class AdminPedidoController {

    private final PedidoRepository pedidoRepository;

    public AdminPedidoController(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @GetMapping
    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Pedido> actualizarEstado(@PathVariable Long id, @RequestParam Pedido.Estado estado) {
        return pedidoRepository.findById(id)
                .map(p -> { p.setEstado(estado); return ResponseEntity.ok(pedidoRepository.save(p)); })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
