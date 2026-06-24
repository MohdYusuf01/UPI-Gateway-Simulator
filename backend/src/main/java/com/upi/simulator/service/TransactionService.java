package com.upi.simulator.service;

import com.upi.simulator.model.*;
import com.upi.simulator.payload.request.SendMoneyRequest;
import com.upi.simulator.payload.response.TransactionResponse;
import com.upi.simulator.repository.BankAccountRepository;
import com.upi.simulator.repository.SystemConfigRepository;
import com.upi.simulator.repository.TransactionRepository;
import com.upi.simulator.repository.UpiAccountRepository;
import com.upi.simulator.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UpiAccountRepository upiAccountRepository;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    @Transactional
    public TransactionResponse processPayment(SendMoneyRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isBlocked()) {
            throw new RuntimeException("Your account is blocked");
        }

        UpiAccount senderUpi = upiAccountRepository.findByUpiId(request.getSenderUpiId())
                .orElseThrow(() -> new RuntimeException("Sender UPI ID not found"));

        if (!senderUpi.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: UPI ID does not belong to user");
        }

        if (!passwordEncoder.matches(request.getTransactionPin(), senderUpi.getTransactionPin())) {
            throw new RuntimeException("Invalid UPI PIN");
        }

        UpiAccount receiverUpi = upiAccountRepository.findByUpiId(request.getReceiverUpiId())
                .orElseThrow(() -> new RuntimeException("Receiver UPI ID not found"));

        if (receiverUpi.getUser().isBlocked()) {
            throw new RuntimeException("Receiver account is blocked");
        }

        if (senderUpi.getUpiId().equals(receiverUpi.getUpiId())) {
             throw new RuntimeException("Cannot send money to yourself");
        }

        BankAccount senderBank = senderUpi.getBankAccount();
        BankAccount receiverBank = receiverUpi.getBankAccount();

        String refNum = UUID.randomUUID().toString();

        // Check transaction limit
        BigDecimal maxLimit = new BigDecimal("50000");
        try {
            maxLimit = systemConfigRepository.findByConfigKey("max_transaction_limit")
                    .map(c -> new BigDecimal(c.getConfigValue()))
                    .orElse(new BigDecimal("50000"));
        } catch (Exception e) {
            // Use default limit if config loading fails
        }

        if (request.getAmount().compareTo(maxLimit) > 0) {
            Transaction failedTx = new Transaction(senderUpi.getUpiId(), receiverUpi.getUpiId(), request.getAmount(), TransactionStatus.FAILED, refNum);
            transactionRepository.save(failedTx);
            throw new RuntimeException("Transaction amount exceeds the maximum limit of ₹" + maxLimit);
        }

        if (senderBank.getBalance().compareTo(request.getAmount()) < 0) {
            // Log failed transaction
            Transaction failedTx = new Transaction(senderUpi.getUpiId(), receiverUpi.getUpiId(), request.getAmount(), TransactionStatus.FAILED, refNum);
            transactionRepository.save(failedTx);
            throw new RuntimeException("Insufficient balance");
        }

        // Deduct from sender
        senderBank.setBalance(senderBank.getBalance().subtract(request.getAmount()));
        bankAccountRepository.save(senderBank);

        // Add to receiver
        receiverBank.setBalance(receiverBank.getBalance().add(request.getAmount()));
        bankAccountRepository.save(receiverBank);

        // Record successful transaction
        Transaction successTx = new Transaction(senderUpi.getUpiId(), receiverUpi.getUpiId(), request.getAmount(), TransactionStatus.SUCCESS, refNum);
        Transaction savedTx = transactionRepository.save(successTx);

        return new TransactionResponse(
                savedTx.getId(),
                savedTx.getSenderUpi(),
                savedTx.getReceiverUpi(),
                savedTx.getAmount(),
                savedTx.getStatus(),
                savedTx.getReferenceNumber(),
                savedTx.getTimestamp(),
                "DEBIT"
        );
    }

    public List<TransactionResponse> getTransactionHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> userUpiIds = upiAccountRepository.findByUserId(user.getId())
                .stream().map(UpiAccount::getUpiId).collect(Collectors.toList());

        if (userUpiIds.isEmpty()) {
            return List.of();
        }

        List<Transaction> transactions = transactionRepository.findByUpiIdsOrderByTimestampDesc(userUpiIds);

        return transactions.stream().map(tx -> {
            String type = userUpiIds.contains(tx.getSenderUpi()) ? "DEBIT" : "CREDIT";
            return new TransactionResponse(
                    tx.getId(),
                    tx.getSenderUpi(),
                    tx.getReceiverUpi(),
                    tx.getAmount(),
                    tx.getStatus(),
                    tx.getReferenceNumber(),
                    tx.getTimestamp(),
                    type
            );
        }).collect(Collectors.toList());
    }
}
