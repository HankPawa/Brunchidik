package com.brunch.repositories;

import com.brunch.models.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByDisponibleTrue();
    List<MenuItem> findByCategoria_Id(Long categoriaId);
}
