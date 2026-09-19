package com.finsight.controller;

import com.finsight.dto.TransactionDto;
import com.finsight.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<TransactionDto>> getTransactions(Authentication authentication) {
        return ResponseEntity.ok(transactionService.getUserTransactions(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<TransactionDto> createTransaction(@Valid @RequestBody TransactionDto dto, Authentication authentication) {
        return ResponseEntity.ok(transactionService.createTransaction(dto, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionDto> updateTransaction(@PathVariable Long id, @Valid @RequestBody TransactionDto dto, Authentication authentication) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, dto, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id, Authentication authentication) {
        transactionService.deleteTransaction(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
