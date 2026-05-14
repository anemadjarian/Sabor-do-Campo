package com.sabordocampo.menu.service;

import com.sabordocampo.menu.domain.Category;
import com.sabordocampo.menu.domain.MenuItem;
import com.sabordocampo.menu.dto.CategoryResponse;
import com.sabordocampo.menu.dto.MenuItemRequest;
import com.sabordocampo.menu.dto.MenuItemResponse;
import com.sabordocampo.menu.repository.MenuItemRepository;
import com.sabordocampo.cart.repository.CartItemRepository;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MenuService {
    private final MenuItemRepository menuItemRepository;
    private final CartItemRepository cartItemRepository;

    public MenuService(MenuItemRepository menuItemRepository, CartItemRepository cartItemRepository) {
        this.menuItemRepository = menuItemRepository;
        this.cartItemRepository = cartItemRepository;
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> listMenuItems(String categoryValue) {
        List<MenuItem> items = (categoryValue == null || categoryValue.isBlank())
            ? menuItemRepository.findAllByOrderByCategoryAscIdAsc()
            : menuItemRepository.findByCategoryOrderByIdAsc(Category.fromValue(categoryValue));

        return items.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listCategories() {
        return Arrays.stream(Category.values())
            .map(category -> new CategoryResponse(category.name(), category.getDisplayName()))
            .toList();
    }

    @Transactional
    public MenuItemResponse createMenuItem(MenuItemRequest request) {
        MenuItem menuItem = new MenuItem(
            request.name().trim(),
            request.description().trim(),
            request.price(),
            Category.fromValue(request.category()),
            normalizeIngredients(request.ingredients()),
            normalizeImageUrl(request.imageUrl())
        );

        return toResponse(menuItemRepository.save(menuItem));
    }

    @Transactional
    public MenuItemResponse updateMenuItem(Long id, MenuItemRequest request) {
        MenuItem menuItem = menuItemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Produto nao encontrado."));

        menuItem.update(
            request.name().trim(),
            request.description().trim(),
            request.price(),
            Category.fromValue(request.category()),
            normalizeIngredients(request.ingredients()),
            normalizeImageUrl(request.imageUrl())
        );

        return toResponse(menuItemRepository.save(menuItem));
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        if (!menuItemRepository.existsById(id)) {
            throw new IllegalArgumentException("Produto nao encontrado.");
        }

        cartItemRepository.deleteByMenuItemId(id);
        menuItemRepository.deleteById(id);
    }

    @Transactional
    public void seedData() {
        if (menuItemRepository.count() > 0) {
            return;
        }

        createMenuItem(new MenuItemRequest(
            "Bolinho Caipira",
            "Porcao artesanal crocante, servida com molho da casa.",
            new java.math.BigDecimal("18.90"),
            "ENTRADA",
            "Carne temperada, farinha de milho, cheiro-verde",
            "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80"
        ));
        createMenuItem(new MenuItemRequest(
            "Salada da Horta",
            "Folhas frescas, legumes grelhados e vinagrete de limao.",
            new java.math.BigDecimal("22.50"),
            "ENTRADA",
            "Alface, tomate, abobrinha, cenoura",
            ""
        ));
        createMenuItem(new MenuItemRequest(
            "Frango ao Molho Pardo",
            "Receita tradicional com arroz branco e angu cremoso.",
            new java.math.BigDecimal("39.90"),
            "PRATO_PRINCIPAL",
            "Frango caipira, arroz, angu, temperos frescos",
            "https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=600&q=80"
        ));
        createMenuItem(new MenuItemRequest(
            "Costelinha na Lenha",
            "Costela suina assada lentamente com mandioca amanteigada.",
            new java.math.BigDecimal("44.90"),
            "PRATO_PRINCIPAL",
            "Costelinha suina, mandioca, alho, cebola",
            ""
        ));
        createMenuItem(new MenuItemRequest(
            "Doce de Leite Cremoso",
            "Sobremesa da casa finalizada com raspas de canela.",
            new java.math.BigDecimal("14.00"),
            "SOBREMESA",
            "Leite, acucar, canela",
            ""
        ));
        createMenuItem(new MenuItemRequest(
            "Suco Verde da Fazenda",
            "Couve, limao, maca e hortela batidos na hora.",
            new java.math.BigDecimal("12.50"),
            "BEBIDA",
            "Couve, limao, maca, hortela",
            ""
        ));
    }

    private MenuItemResponse toResponse(MenuItem menuItem) {
        List<String> ingredients = Arrays.stream(menuItem.getIngredients().split(","))
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .collect(Collectors.toList());

        return new MenuItemResponse(
            menuItem.getId(),
            menuItem.getName(),
            menuItem.getDescription(),
            menuItem.getPrice(),
            menuItem.getCategory().name(),
            menuItem.getCategory().getDisplayName(),
            ingredients,
            normalizeOptional(menuItem.getImageUrl())
        );
    }

    private String normalizeIngredients(String ingredients) {
        if (ingredients == null || ingredients.isBlank()) {
            return "";
        }

        return Arrays.stream(ingredients.split(","))
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .collect(Collectors.joining(", "));
    }

    private String normalizeOptional(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeImageUrl(String value) {
        String normalized = normalizeOptional(value);
        if (normalized.isBlank()) {
            return "";
        }
        if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
            return normalized;
        }
        if (normalized.startsWith("www.")) {
            return "https://" + normalized;
        }
        return normalized;
    }
}
