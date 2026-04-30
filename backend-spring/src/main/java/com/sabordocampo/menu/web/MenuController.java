package com.sabordocampo.menu.web;

import com.sabordocampo.menu.dto.CategoryResponse;
import com.sabordocampo.menu.dto.MenuItemRequest;
import com.sabordocampo.menu.dto.MenuItemResponse;
import com.sabordocampo.menu.service.MenuService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class MenuController {
    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping("/health")
    public java.util.Map<String, String> health() {
        return java.util.Map.of("status", "ok");
    }

    @GetMapping("/categories")
    public List<CategoryResponse> listCategories() {
        return menuService.listCategories();
    }

    @GetMapping("/menu-items")
    public List<MenuItemResponse> listMenuItems(@RequestParam(required = false) String category) {
        return menuService.listMenuItems(category);
    }

    @PostMapping("/menu-items")
    public MenuItemResponse createMenuItem(@Valid @RequestBody MenuItemRequest request) {
        return menuService.createMenuItem(request);
    }
}
