package com.brunch.reserva.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "reservas")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nombre;

    @NotBlank
    private String email;

    @NotNull
    @FutureOrPresent(message = "La fecha de reserva no puede ser en el pasado")
    private LocalDate fecha;

    @NotNull
    private LocalTime hora;

    @Min(1)
    private int personas;

    private String ocasion;

    private String notas;

    // Referencia por ID al usuario-service, sin JPA cross-service
    private Long usuarioId;

    public Reserva() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public LocalTime getHora() { return hora; }
    public void setHora(LocalTime hora) { this.hora = hora; }

    public int getPersonas() { return personas; }
    public void setPersonas(int personas) { this.personas = personas; }

    public String getOcasion() { return ocasion; }
    public void setOcasion(String ocasion) { this.ocasion = ocasion; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
}
