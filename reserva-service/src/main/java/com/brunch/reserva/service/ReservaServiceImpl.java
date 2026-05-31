package com.brunch.reserva.service;

import com.brunch.reserva.model.Reserva;
import com.brunch.reserva.repository.ReservaRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ReservaServiceImpl implements ReservaService {

    private final ReservaRepository reservaRepository;
    private final EmailService emailService;
    private final SimpMessagingTemplate ws;

    public ReservaServiceImpl(ReservaRepository reservaRepository,
                               EmailService emailService,
                               SimpMessagingTemplate ws) {
        this.reservaRepository = reservaRepository;
        this.emailService = emailService;
        this.ws = ws;
    }

    @Override
    public Reserva crear(Reserva reserva) {
        Reserva guardada = reservaRepository.save(reserva);
        emailService.enviarConfirmacionReserva(guardada);
        ws.convertAndSend("/topic/admin/reservas", guardada);
        return guardada;
    }

    @Override
    public List<Reserva> listarPorUsuario(Long usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId);
    }

    @Override
    public Reserva buscarPorId(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
    }

    @Override
    public void eliminar(Long id) {
        reservaRepository.deleteById(id);
    }
}
