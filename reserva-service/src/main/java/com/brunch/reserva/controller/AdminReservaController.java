package com.brunch.reserva.controller;

import com.brunch.reserva.model.Reserva;
import com.brunch.reserva.repository.ReservaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reservas")
public class AdminReservaController {

    private final ReservaRepository reservaRepository;

    public AdminReservaController(ReservaRepository reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    @GetMapping
    public List<Reserva> listarTodas() {
        return reservaRepository.findAll();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        reservaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
