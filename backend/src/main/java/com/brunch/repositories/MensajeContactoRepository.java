package com.brunch.repositories;

import com.brunch.models.MensajeContacto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MensajeContactoRepository extends JpaRepository<MensajeContacto, Long> {
}
