package com.brunch.pedido.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Read-only mapping onto the shared "usuarios" table (owned by usuario-service),
 * used solely to check the caller's role on /api/admin/** requests.
 */
@Entity
@Table(name = "usuarios")
public class UsuarioRef {

    @Id
    private Long id;

    private String rol;

    public Long getId() { return id; }
    public String getRol() { return rol; }
}
