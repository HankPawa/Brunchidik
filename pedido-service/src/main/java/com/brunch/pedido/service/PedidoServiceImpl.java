package com.brunch.pedido.service;

import com.brunch.pedido.model.Pedido;
import com.brunch.pedido.repository.PedidoRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PedidoServiceImpl implements PedidoService {

    private final PedidoRepository pedidoRepository;
    private final SimpMessagingTemplate ws;

    public PedidoServiceImpl(PedidoRepository pedidoRepository, SimpMessagingTemplate ws) {
        this.pedidoRepository = pedidoRepository;
        this.ws = ws;
    }

    @Override
    public Pedido crear(Pedido pedido) {
        if (pedido.getDetalles() != null) {
            pedido.getDetalles().forEach(d -> d.setPedido(pedido));
        }
        Pedido guardado = pedidoRepository.save(pedido);
        ws.convertAndSend("/topic/admin/pedidos", guardado);
        return guardado;
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
        Pedido actualizado = pedidoRepository.save(pedido);
        ws.convertAndSend("/topic/usuario/" + actualizado.getUsuarioId() + "/pedido", actualizado);
        ws.convertAndSend("/topic/admin/pedidos/estado", actualizado);
        return actualizado;
    }
}
