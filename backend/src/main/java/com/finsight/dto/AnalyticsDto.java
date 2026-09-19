package com.finsight.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class AnalyticsDto {
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal savings;
    private BigDecimal savingsRate;
    private Integer numberOfTransactions;
    private String highestSpendingCategory;
    private BigDecimal highestSpendingDayAmount;
    private BigDecimal averageDailySpending;
    private Map<String, BigDecimal> spendingByCategory;
    private Map<String, BigDecimal> monthlyTrend;
}
