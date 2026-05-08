package com.brunch.services;

import com.brunch.models.MenuItem;
import java.util.List;

public interface MenuService {
    List<MenuItem> listarDisponibles();
    List<MenuItem> listarPorCategoria(Long categoriaId);
    MenuItem buscarPorId(Long id);
    MenuItem crear(MenuItem item);
    MenuItem actualizar(Long id, MenuItem item);
    void eliminar(Long id);
}
