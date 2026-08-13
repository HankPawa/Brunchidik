package com.brunch.usuario.controller;

import com.brunch.usuario.model.Usuario;
import com.brunch.usuario.repository.UsuarioRepository;
import com.brunch.usuario.service.CodigoService;
import com.brunch.usuario.service.EmailService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final CodigoService     codigoService;
    private final EmailService      emailService;
    private static final Logger log = LoggerFactory.getLogger(UsuarioController.class);
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public UsuarioController(UsuarioRepository usuarioRepository,
                             CodigoService codigoService,
                             EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.codigoService     = codigoService;
        this.emailService      = emailService;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@Valid @RequestBody Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            return ResponseEntity.badRequest().body("El correo ya está registrado");
        }
        usuario.setPassword(encoder.encode(usuario.getPassword()));
        return ResponseEntity.ok(usuarioRepository.save(usuario));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario credenciales) {
        return usuarioRepository.findByEmail(credenciales.getEmail())
                .filter(u -> encoder.matches(credenciales.getPassword(), u.getPassword()))
                .map(u -> {
                    if (u.isDosFaActivo()) {
                        String codigo = codigoService.generarYGuardar(u.getId());
                        try { emailService.enviarCodigo2FA(u.getEmail(), codigo); } catch (Exception ex) { log.error("Error enviando 2FA a {}: {}", u.getEmail(), ex.getMessage()); }
                        return ResponseEntity.ok((Object) Map.of(
                            "requiere2fa", true,
                            "usuarioId",   u.getId(),
                            "email",       u.getEmail()
                        ));
                    }
                    return ResponseEntity.ok((Object) u);
                })
                .orElse(ResponseEntity.status(401).body("Credenciales incorrectas"));
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        String email  = body.get("email");
        String nombre = body.get("nombre");

        Usuario u = usuarioRepository.findByEmail(email).orElseGet(() -> {
            Usuario nuevo = new Usuario();
            nuevo.setNombre(nombre);
            nuevo.setEmail(email);
            nuevo.setPassword(encoder.encode(java.util.UUID.randomUUID().toString()));
            nuevo.setCuentaGoogle(true);
            return usuarioRepository.save(nuevo);
        });

        if (u.isDosFaActivo()) {
            String codigo = codigoService.generarYGuardar(u.getId());
            try { emailService.enviarCodigo2FA(u.getEmail(), codigo); } catch (Exception ex) { log.error("Error enviando 2FA a {}: {}", u.getEmail(), ex.getMessage()); }
            return ResponseEntity.ok(Map.of(
                "requiere2fa", true,
                "usuarioId",   u.getId(),
                "email",       u.getEmail()
            ));
        }

        return ResponseEntity.ok(u);
    }

    @PostMapping("/2fa/enviar")
    public ResponseEntity<?> enviarCodigo(@RequestBody Map<String, Object> body) {
        Long usuarioId = Long.valueOf(body.get("usuarioId").toString());
        return usuarioRepository.findById(usuarioId).map(u -> {
            String codigo = codigoService.generarYGuardar(u.getId());
            try { emailService.enviarCodigo2FA(u.getEmail(), codigo); } catch (Exception e) {
                return ResponseEntity.status(500).body((Object) "Error al enviar el correo");
            }
            return ResponseEntity.ok((Object) "Código enviado");
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/2fa/verificar")
    public ResponseEntity<?> verificarCodigo(@RequestBody Map<String, Object> body) {
        Long   usuarioId = Long.valueOf(body.get("usuarioId").toString());
        String codigo    = body.get("codigo").toString();

        if (!codigoService.verificar(usuarioId, codigo)) {
            return ResponseEntity.status(401).body("Código incorrecto o expirado");
        }

        return usuarioRepository.findById(usuarioId)
                .map(u -> ResponseEntity.ok((Object) u))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<?> cambiarPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String actual = body.get("actual");
        String nueva  = body.get("nueva");

        return usuarioRepository.findById(id)
                .map(u -> {
                    if (!encoder.matches(actual, u.getPassword())) {
                        return ResponseEntity.status(401).body((Object) "Contraseña actual incorrecta");
                    }
                    u.setPassword(encoder.encode(nueva));
                    return ResponseEntity.ok((Object) usuarioRepository.save(u));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/suscripcion")
    public ResponseEntity<?> suscribir(@PathVariable Long id, @RequestParam boolean activo) {
        return usuarioRepository.findById(id)
                .map(u -> {
                    u.setSuscrito(activo);
                    return ResponseEntity.ok((Object) usuarioRepository.save(u));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/2fa")
    public ResponseEntity<?> toggle2fa(@PathVariable Long id, @RequestParam boolean activo) {
        return usuarioRepository.findById(id)
                .map(u -> {
                    u.setDosFaActivo(activo);
                    return ResponseEntity.ok((Object) usuarioRepository.save(u));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
