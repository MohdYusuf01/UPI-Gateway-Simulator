package com.upi.simulator.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UpiResponse {
    private Long id;
    private String upiId;
    private Long bankAccountId;
}
