package com.brunch.controllers;

import com.brunch.models.MensajeContacto;
import com.brunch.repositories.MensajeContactoRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/contacto")
public class ContactoController {

    private final MensajeContactoRepository repository;

    public ContactoController(MensajeContactoRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<MensajeContacto> enviar(@Valid @RequestBody MensajeContacto mensaje) {
        return ResponseEntity.ok(repository.save(mensaje));
    }

    @GetMapping
    public List<MensajeContacto> listar() {
        return repository.findAll();
    }
}
