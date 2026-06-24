package com.upi.simulator.payload.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SendMoneyRequest {
    @NotBlank
    private String senderUpiId;

    @NotBlank
    private String receiverUpiId;

    @NotNull
    @DecimalMin(value = "1.0", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank
    private String transactionPin;
}
