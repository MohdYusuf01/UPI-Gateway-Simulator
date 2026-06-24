package com.upi.simulator.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateUpiRequest {
    @NotNull
    private Long bankAccountId;

    @NotBlank
    private String upiId;

    @NotBlank
    @Size(min = 4, max = 6)
    private String transactionPin;
}
