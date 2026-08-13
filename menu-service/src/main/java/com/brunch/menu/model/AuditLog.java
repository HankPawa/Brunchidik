package com.brunch.menu.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String accion;

    @Column(nullable = false, length = 500)
    private String detalle;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(nullable = false)
    private String servicio;

    public AuditLog() {}

    public AuditLog(String accion, String detalle, String servicio) {
        this.accion   = accion;
        this.detalle  = detalle;
        this.servicio = servicio;
        this.fecha    = LocalDateTime.now();
    }

    public Long getId()            { return id; }
    public String getAccion()      { return accion; }
    public String getDetalle()     { return detalle; }
    public LocalDateTime getFecha(){ return fecha; }
    public String getServicio()    { return servicio; }
}
