package com.finsight.controller;

import com.finsight.dto.CategoryDto;
import com.finsight.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getCategories(Authentication authentication) {
        return ResponseEntity.ok(categoryService.getUserCategories(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(@RequestBody CategoryDto dto, Authentication authentication) {
        return ResponseEntity.ok(categoryService.createCategory(dto, authentication.getName()));
    }
}
