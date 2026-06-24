package com.upi.simulator.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AddBankRequest {
    @NotBlank
    private String accountNumber;

    @NotBlank
    private String ifsc;

    @NotBlank
    private String bankName;

    private BigDecimal initialBalance;
}
