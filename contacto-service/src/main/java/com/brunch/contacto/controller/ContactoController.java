package com.brunch.contacto.controller;

import com.brunch.contacto.model.MensajeContacto;
import com.brunch.contacto.repository.MensajeContactoRepository;
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
