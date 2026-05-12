package com.brunch.contacto.repository;

import com.brunch.contacto.model.MensajeContacto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MensajeContactoRepository extends JpaRepository<MensajeContacto, Long> {}
