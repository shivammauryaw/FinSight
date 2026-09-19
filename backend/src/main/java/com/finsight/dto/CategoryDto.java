package com.finsight.dto;

import com.finsight.entity.enums.CategoryType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryDto {
    private Long id;
    private String name;
    private CategoryType type;
}
