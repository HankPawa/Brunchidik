package com.brunch.services;

import com.brunch.models.MenuItem;
import com.brunch.repositories.MenuItemRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MenuServiceImpl implements MenuService {

    private final MenuItemRepository menuItemRepository;

    public MenuServiceImpl(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    @Override
    public List<MenuItem> listarDisponibles() {
        return menuItemRepository.findByDisponibleTrue();
    }

    @Override
    public List<MenuItem> listarPorCategoria(Long categoriaId) {
        return menuItemRepository.findByCategoriaId(categoriaId);
    }

    @Override
    public MenuItem buscarPorId(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item no encontrado"));
    }

    @Override
    public MenuItem crear(MenuItem item) {
        return menuItemRepository.save(item);
    }

    @Override
    public MenuItem actualizar(Long id, MenuItem item) {
        MenuItem existente = buscarPorId(id);
        existente.setNombre(item.getNombre());
        existente.setDescripcion(item.getDescripcion());
        existente.setPrecio(item.getPrecio());
        existente.setDisponible(item.isDisponible());
        return menuItemRepository.save(existente);
    }

    @Override
    public void eliminar(Long id) {
        menuItemRepository.deleteById(id);
    }
}
