package com.upi.simulator.repository;

import com.upi.simulator.model.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
    List<BankAccount> findByUserId(Long userId);
    boolean existsByAccountNumber(String accountNumber);
    long countByUserId(Long userId);
}
