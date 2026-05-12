package com.brunch.pedido.service;

import com.brunch.pedido.model.Pedido;
import java.util.List;

public interface PedidoService {
    Pedido crear(Pedido pedido);
    List<Pedido> listarPorUsuario(Long usuarioId);
    Pedido buscarPorId(Long id);
    Pedido actualizarEstado(Long id, Pedido.Estado estado);
}
