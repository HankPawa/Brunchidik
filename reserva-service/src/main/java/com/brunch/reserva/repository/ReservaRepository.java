package com.brunch.reserva.repository;

import com.brunch.reserva.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByUsuarioId(Long usuarioId);
}
