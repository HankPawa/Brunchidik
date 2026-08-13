package com.brunch.pedido.controller;

import com.brunch.pedido.model.AuditLog;
import com.brunch.pedido.model.Pedido;
import com.brunch.pedido.repository.AuditLogRepository;
import com.brunch.pedido.repository.PedidoRepository;
import com.brunch.pedido.service.PedidoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/pedidos")
public class AdminPedidoController {

    private final PedidoRepository pedidoRepository;
    private final PedidoService pedidoService;
    private final AuditLogRepository auditLogRepository;

    public AdminPedidoController(PedidoRepository pedidoRepository,
                                 PedidoService pedidoService,
                                 AuditLogRepository auditLogRepository) {
        this.pedidoRepository    = pedidoRepository;
        this.pedidoService       = pedidoService;
        this.auditLogRepository  = auditLogRepository;
    }

    @GetMapping
    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    @GetMapping("/audit")
    public List<AuditLog> listarAudit() {
        return auditLogRepository.findTop100ByOrderByFechaDesc();
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Pedido> actualizarEstado(@PathVariable Long id, @RequestParam Pedido.Estado estado) {
        try {
            Pedido actualizado = pedidoService.actualizarEstado(id, estado);
            auditLogRepository.save(new AuditLog(
                "CAMBIAR_ESTADO_PEDIDO",
                "Cambió el pedido #" + id + " a " + estado.name(),
                "pedidos"
            ));
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
