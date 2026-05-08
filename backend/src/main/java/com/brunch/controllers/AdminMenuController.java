package com.brunch.controllers;

import com.brunch.models.Categoria;
import com.brunch.models.MenuItem;
import com.brunch.repositories.CategoriaRepository;
import com.brunch.repositories.MenuItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/menu")
public class AdminMenuController {

    private final MenuItemRepository menuItemRepository;
    private final CategoriaRepository categoriaRepository;

    public AdminMenuController(MenuItemRepository menuItemRepository,
                               CategoriaRepository categoriaRepository) {
        this.menuItemRepository = menuItemRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @GetMapping
    public List<MenuItem> listarTodos() {
        return menuItemRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> body) {
        MenuItem item = buildItem(new MenuItem(), body);
        return ResponseEntity.ok(menuItemRepository.save(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return menuItemRepository.findById(id).map(item -> {
            buildItem(item, body);
            return ResponseEntity.ok(menuItemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        menuItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private MenuItem buildItem(MenuItem item, Map<String, Object> body) {
        item.setNombre((String) body.get("nombre"));
        item.setDescripcion((String) body.get("descripcion"));
        item.setPrecio(new java.math.BigDecimal(body.get("precio").toString()));
        item.setDisponible((Boolean) body.getOrDefault("disponible", true));
        Long catId = Long.valueOf(body.get("categoriaId").toString());
        Categoria cat = categoriaRepository.findById(catId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        item.setCategoria(cat);
        if (body.get("imagenUrl") != null) item.setImagenUrl((String) body.get("imagenUrl"));
        return item;
    }
}
