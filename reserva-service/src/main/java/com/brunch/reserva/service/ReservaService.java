package com.brunch.reserva.service;

import com.brunch.reserva.model.Reserva;
import java.util.List;

public interface ReservaService {
    Reserva crear(Reserva reserva);
    List<Reserva> listarPorUsuario(Long usuarioId);
    Reserva buscarPorId(Long id);
    void eliminar(Long id);
}
