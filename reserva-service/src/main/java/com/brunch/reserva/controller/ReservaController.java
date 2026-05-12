package com.brunch.reserva.controller;

import com.brunch.reserva.model.Reserva;
import com.brunch.reserva.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @PostMapping
    public ResponseEntity<Reserva> crear(@Valid @RequestBody Reserva reserva) {
        return ResponseEntity.ok(reservaService.crear(reserva));
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Reserva> listarPorUsuario(@PathVariable Long usuarioId) {
        return reservaService.listarPorUsuario(usuarioId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reserva> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(reservaService.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        reservaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
