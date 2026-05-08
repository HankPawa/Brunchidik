package com.brunch.services;

import com.brunch.models.Pedido;
import com.brunch.repositories.PedidoRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PedidoServiceImpl implements PedidoService {

    private final PedidoRepository pedidoRepository;

    public PedidoServiceImpl(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @Override
    public Pedido crear(Pedido pedido) {
        if (pedido.getDetalles() != null) {
            pedido.getDetalles().forEach(d -> d.setPedido(pedido));
        }
        return pedidoRepository.save(pedido);
    }

    @Override
    public List<Pedido> listarPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId);
    }

    @Override
    public Pedido buscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
    }

    @Override
    public Pedido actualizarEstado(Long id, Pedido.Estado estado) {
        Pedido pedido = buscarPorId(id);
        pedido.setEstado(estado);
        return pedidoRepository.save(pedido);
    }
}
