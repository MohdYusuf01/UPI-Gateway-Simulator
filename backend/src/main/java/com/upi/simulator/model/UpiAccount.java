package com.upi.simulator.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "upi_accounts")
@Data
@NoArgsConstructor
public class UpiAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String upiId;

    @NotBlank
    @JsonIgnore
    private String transactionPin;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bank_account_id", nullable = false)
    private BankAccount bankAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public UpiAccount(String upiId, String transactionPin, BankAccount bankAccount, User user) {
        this.upiId = upiId;
        this.transactionPin = transactionPin;
        this.bankAccount = bankAccount;
        this.user = user;
    }
}
