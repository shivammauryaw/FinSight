package com.finsight.dto;

import com.finsight.entity.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionDto {
    private Long id;
    
    @NotNull(message = "Type is required")
    private TransactionType type;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;
    
    private Long categoryId;
    private CategoryDto category;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    private String paymentMethod;
    
    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;
    
    private String notes;
    private LocalDateTime createdAt;
}
