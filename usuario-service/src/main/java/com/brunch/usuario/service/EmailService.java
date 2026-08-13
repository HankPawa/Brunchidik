package com.brunch.usuario.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCodigo2FA(String destinatario, String codigo) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setFrom("onboarding@resend.dev");
        mensaje.setTo(destinatario);
        mensaje.setSubject("Tu código de verificación — Brunch & Co.");
        mensaje.setText(
            "Hola,\n\n" +
            "Tu código de verificación es:\n\n" +
            "    " + codigo + "\n\n" +
            "Este código expira en 5 minutos.\n" +
            "Si no fuiste tú, ignora este mensaje.\n\n" +
            "— Brunch & Co."
        );
        mailSender.send(mensaje);
    }
}
