package com.brunch.usuario.config;

import com.brunch.usuario.model.Rol;
import com.brunch.usuario.model.Usuario;
import com.brunch.usuario.repository.UsuarioRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public DataInitializer(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        usuarioRepository.findByEmail("admin@brunch.com").ifPresentOrElse(
            u -> {
                u.setRol(Rol.ADMIN);
                usuarioRepository.save(u);
            },
            () -> {
                Usuario admin = new Usuario();
                admin.setNombre("Admin Brunch");
                admin.setEmail("admin@brunch.com");
                admin.setPassword(encoder.encode("brunch123"));
                admin.setRol(Rol.ADMIN);
                usuarioRepository.save(admin);
            }
        );
    }
}
