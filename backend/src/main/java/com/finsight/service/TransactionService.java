package com.finsight.service;

import com.finsight.dto.CategoryDto;
import com.finsight.dto.TransactionDto;
import com.finsight.entity.Category;
import com.finsight.entity.Transaction;
import com.finsight.entity.User;
import com.finsight.repository.CategoryRepository;
import com.finsight.repository.TransactionRepository;
import com.finsight.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<TransactionDto> getUserTransactions(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        return transactionRepository.findByUserIdOrderByTransactionDateDesc(user.getId())
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public TransactionDto createTransaction(TransactionDto dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        Transaction transaction = Transaction.builder()
                .user(user)
                .type(dto.getType())
                .amount(dto.getAmount())
                .category(category)
                .description(dto.getDescription())
                .paymentMethod(dto.getPaymentMethod())
                .transactionDate(dto.getTransactionDate())
                .notes(dto.getNotes())
                .build();

        return mapToDto(transactionRepository.save(transaction));
    }

    public TransactionDto updateTransaction(Long id, TransactionDto dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Transaction transaction = transactionRepository.findById(id).orElseThrow();
        
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized");
        }

        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        transaction.setType(dto.getType());
        transaction.setAmount(dto.getAmount());
        transaction.setCategory(category);
        transaction.setDescription(dto.getDescription());
        transaction.setPaymentMethod(dto.getPaymentMethod());
        transaction.setTransactionDate(dto.getTransactionDate());
        transaction.setNotes(dto.getNotes());

        return mapToDto(transactionRepository.save(transaction));
    }

    public void deleteTransaction(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Transaction transaction = transactionRepository.findById(id).orElseThrow();
        
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized");
        }
        
        transactionRepository.delete(transaction);
    }

    private TransactionDto mapToDto(Transaction transaction) {
        CategoryDto catDto = null;
        if (transaction.getCategory() != null) {
            catDto = CategoryDto.builder()
                    .id(transaction.getCategory().getId())
                    .name(transaction.getCategory().getName())
                    .type(transaction.getCategory().getType())
                    .build();
        }

        return TransactionDto.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .categoryId(transaction.getCategory() != null ? transaction.getCategory().getId() : null)
                .category(catDto)
                .description(transaction.getDescription())
                .paymentMethod(transaction.getPaymentMethod())
                .transactionDate(transaction.getTransactionDate())
                .notes(transaction.getNotes())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
