package com.brunch.reserva.service;

import com.brunch.reserva.model.Reserva;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarConfirmacionReserva(Reserva reserva) {
        try {
            String fecha = reserva.getFecha()
                    .format(DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", new Locale("es", "CO")));
            String hora  = reserva.getHora().toString().substring(0, 5);

            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom("onboarding@resend.dev");
            msg.setTo(reserva.getEmail());
            msg.setSubject("Reserva confirmada — Brunch & Co.");
            msg.setText(
                "Hola, " + reserva.getNombre() + "!\n\n" +
                "Tu reserva en Brunch & Co. ha sido registrada con éxito.\n\n" +
                "  Fecha:    " + fecha + "\n" +
                "  Hora:     " + hora + "\n" +
                "  Personas: " + reserva.getPersonas() + "\n" +
                (reserva.getOcasion() != null && !reserva.getOcasion().isEmpty()
                    ? "  Ocasion:  " + reserva.getOcasion() + "\n"
                    : "") +
                "\nTe esperamos. Si necesitas hacer cambios, contáctanos por WhatsApp.\n\n" +
                "— Brunch & Co."
            );
            mailSender.send(msg);
        } catch (Exception e) {
            // Fallo silencioso: el email es una notificación opcional
        }
    }
}
