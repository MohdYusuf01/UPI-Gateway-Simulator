package com.upi.simulator.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserSummaryResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private boolean blocked;
    private LocalDateTime createdAt;
    private long bankAccountsCount;
    private long upiAccountsCount;
}
