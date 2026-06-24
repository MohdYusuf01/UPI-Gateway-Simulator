package com.upi.simulator.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class AccountResponse {
    private Long id;
    private String accountNumber;
    private String ifsc;
    private String bankName;
    private BigDecimal balance;
}
