package com.upi.simulator.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class AdminStatsResponse {
    private long totalUsers;
    private BigDecimal totalTransactionVolume;
    private long totalTransactionCount;
    private long successfulTransactions;
    private long failedTransactions;
    private double successRate;
    private BigDecimal activeLimit;
}
