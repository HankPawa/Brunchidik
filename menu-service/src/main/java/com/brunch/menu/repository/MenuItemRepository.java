package com.brunch.menu.repository;

import com.brunch.menu.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByDisponibleTrue();
    List<MenuItem> findByCategoria_Id(Long categoriaId);

    @Modifying
    @Query("DELETE FROM MenuItem m WHERE m.id = :id")
    void deleteDirectly(@Param("id") Long id);
}
