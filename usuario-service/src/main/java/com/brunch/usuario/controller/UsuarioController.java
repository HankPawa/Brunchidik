package com.brunch.usuario.controller;

import com.brunch.usuario.model.Usuario;
import com.brunch.usuario.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
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
                .map(u -> ResponseEntity.ok((Object) u))
                .orElse(ResponseEntity.status(401).body("Credenciales incorrectas"));
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        String email  = body.get("email");
        String nombre = body.get("nombre");

        return ResponseEntity.ok(
            usuarioRepository.findByEmail(email).orElseGet(() -> {
                Usuario nuevo = new Usuario();
                nuevo.setNombre(nombre);
                nuevo.setEmail(email);
                nuevo.setPassword(encoder.encode(java.util.UUID.randomUUID().toString()));
                nuevo.setCuentaGoogle(true);
                return usuarioRepository.save(nuevo);
            })
        );
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
