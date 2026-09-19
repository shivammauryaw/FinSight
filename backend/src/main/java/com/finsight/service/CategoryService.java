package com.finsight.service;

import com.finsight.dto.CategoryDto;
import com.finsight.entity.Category;
import com.finsight.entity.User;
import com.finsight.repository.CategoryRepository;
import com.finsight.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<CategoryDto> getUserCategories(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return categoryRepository.findByUserIdOrUserIsNull(user.getId())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }
    
    public CategoryDto createCategory(CategoryDto dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Category category = Category.builder()
                .name(dto.getName())
                .type(dto.getType())
                .user(user)
                .build();
        return mapToDto(categoryRepository.save(category));
    }
    
    private CategoryDto mapToDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .build();
    }
}
