package com.upi.simulator.repository;

import com.upi.simulator.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    @Query("SELECT t FROM Transaction t WHERE t.senderUpi IN :upiIds OR t.receiverUpi IN :upiIds ORDER BY t.timestamp DESC")
    List<Transaction> findByUpiIdsOrderByTimestampDesc(@Param("upiIds") List<String> upiIds);
    
    long countByStatus(com.upi.simulator.model.TransactionStatus status);
    
    List<Transaction> findAllByOrderByTimestampDesc();
}
