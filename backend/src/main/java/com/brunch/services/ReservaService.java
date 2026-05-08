package com.brunch.services;

import com.brunch.models.Reserva;
import java.util.List;

public interface ReservaService {
    Reserva crear(Reserva reserva);
    List<Reserva> listarPorUsuario(Long usuarioId);
    Reserva buscarPorId(Long id);
    void eliminar(Long id);
}
