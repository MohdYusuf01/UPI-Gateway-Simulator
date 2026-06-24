package com.upi.simulator.repository;

import com.upi.simulator.model.UpiAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UpiAccountRepository extends JpaRepository<UpiAccount, Long> {
    List<UpiAccount> findByUserId(Long userId);
    Optional<UpiAccount> findByUpiId(String upiId);
    boolean existsByUpiId(String upiId);
    boolean existsByBankAccountId(Long bankAccountId);
    long countByUserId(Long userId);
}
