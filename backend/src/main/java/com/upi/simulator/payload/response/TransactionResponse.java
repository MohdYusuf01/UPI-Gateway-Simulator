package com.upi.simulator.payload.response;

import com.upi.simulator.model.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private String senderUpi;
    private String receiverUpi;
    private BigDecimal amount;
    private TransactionStatus status;
    private String referenceNumber;
    private LocalDateTime timestamp;
    private String type; // CREDIT or DEBIT depending on the querying user
}
