package com.brunch.services;

import com.brunch.models.Pedido;
import java.util.List;

public interface PedidoService {
    Pedido crear(Pedido pedido);
    List<Pedido> listarPorUsuario(Long usuarioId);
    Pedido buscarPorId(Long id);
    Pedido actualizarEstado(Long id, Pedido.Estado estado);
}
