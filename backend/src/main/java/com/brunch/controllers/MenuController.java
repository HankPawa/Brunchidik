package com.brunch.controllers;

import com.brunch.models.MenuItem;
import com.brunch.services.MenuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping
    public List<MenuItem> listar() {
        return menuService.listarDisponibles();
    }

    @GetMapping("/categoria/{id}")
    public List<MenuItem> listarPorCategoria(@PathVariable Long id) {
        return menuService.listarPorCategoria(id);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<MenuItem> crear(@RequestBody MenuItem item) {
        return ResponseEntity.ok(menuService.crear(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> actualizar(@PathVariable Long id, @RequestBody MenuItem item) {
        return ResponseEntity.ok(menuService.actualizar(id, item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        menuService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
