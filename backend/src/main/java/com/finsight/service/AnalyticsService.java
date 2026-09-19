package com.finsight.service;

import com.finsight.dto.AnalyticsDto;
import com.finsight.entity.Transaction;
import com.finsight.entity.User;
import com.finsight.entity.enums.TransactionType;
import com.finsight.repository.TransactionRepository;
import com.finsight.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public AnalyticsDto getAnalytics(String userEmail, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        List<Transaction> txs;
        
        if (startDate != null && endDate != null) {
            txs = transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(user.getId(), startDate, endDate);
        } else {
            txs = transactionRepository.findByUserIdOrderByTransactionDateDesc(user.getId());
        }

        BigDecimal totalIncome = txs.stream()
                .filter(t -> t.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = txs.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal savings = totalIncome.subtract(totalExpenses);
        BigDecimal savingsRate = BigDecimal.ZERO;
        
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = savings.divide(totalIncome, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
        }

        Map<String, BigDecimal> spendingByCategory = txs.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory() != null ? t.getCategory().getName() : "Uncategorized",
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        String highestCategory = spendingByCategory.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");

        return AnalyticsDto.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .savings(savings)
                .savingsRate(savingsRate)
                .numberOfTransactions(txs.size())
                .highestSpendingCategory(highestCategory)
                .spendingByCategory(spendingByCategory)
                .build();
    }
}
