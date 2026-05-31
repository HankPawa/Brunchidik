package com.brunch.menu.controller;

import com.brunch.menu.model.AuditLog;
import com.brunch.menu.model.Categoria;
import com.brunch.menu.model.MenuItem;
import com.brunch.menu.repository.AuditLogRepository;
import com.brunch.menu.repository.CategoriaRepository;
import com.brunch.menu.repository.MenuItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/menu")
public class AdminMenuController {

    private final MenuItemRepository menuItemRepository;
    private final CategoriaRepository categoriaRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminMenuController(MenuItemRepository menuItemRepository,
                               CategoriaRepository categoriaRepository,
                               AuditLogRepository auditLogRepository) {
        this.menuItemRepository  = menuItemRepository;
        this.categoriaRepository = categoriaRepository;
        this.auditLogRepository  = auditLogRepository;
    }

    @GetMapping
    public List<MenuItem> listarTodos() {
        return menuItemRepository.findAll();
    }

    @GetMapping("/audit")
    public List<AuditLog> listarAudit() {
        return auditLogRepository.findTop100ByOrderByFechaDesc();
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> body) {
        MenuItem item = buildItem(new MenuItem(), body);
        MenuItem saved = menuItemRepository.save(item);
        auditLogRepository.save(new AuditLog(
            "CREAR_PRODUCTO",
            "Creó el producto \"" + saved.getNombre() + "\"",
            "menu"
        ));
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return menuItemRepository.findById(id).map(item -> {
            buildItem(item, body);
            MenuItem saved = menuItemRepository.save(item);
            auditLogRepository.save(new AuditLog(
                "EDITAR_PRODUCTO",
                "Editó el producto \"" + saved.getNombre() + "\"",
                "menu"
            ));
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        return menuItemRepository.findById(id).map(item -> {
            String nombre = item.getNombre();
            menuItemRepository.deleteDirectly(id);
            auditLogRepository.save(new AuditLog(
                "ELIMINAR_PRODUCTO",
                "Eliminó el producto \"" + nombre + "\"",
                "menu"
            ));
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
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
