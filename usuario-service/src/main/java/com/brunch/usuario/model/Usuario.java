package com.brunch.usuario.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nombre;

    @Email
    @NotBlank
    @Column(unique = true)
    private String email;

    @NotBlank
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private boolean dosFaActivo = false;

    private boolean cuentaGoogle = false;

    @Column(columnDefinition = "boolean default false")
    private boolean suscrito = false;

    @Enumerated(EnumType.STRING)
    private Rol rol = Rol.USUARIO;

    public Usuario() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public boolean isDosFaActivo() { return dosFaActivo; }
    public void setDosFaActivo(boolean dosFaActivo) { this.dosFaActivo = dosFaActivo; }

    public boolean isCuentaGoogle() { return cuentaGoogle; }
    public void setCuentaGoogle(boolean cuentaGoogle) { this.cuentaGoogle = cuentaGoogle; }

    public Rol getRol() { return rol; }
    public void setRol(Rol rol) { this.rol = rol; }

    public boolean isSuscrito() { return suscrito; }
    public void setSuscrito(boolean suscrito) { this.suscrito = suscrito; }
}
