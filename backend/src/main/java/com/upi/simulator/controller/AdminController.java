package com.upi.simulator.controller;

import com.upi.simulator.model.*;
import com.upi.simulator.payload.response.AdminStatsResponse;
import com.upi.simulator.payload.response.MessageResponse;
import com.upi.simulator.payload.response.UserSummaryResponse;
import com.upi.simulator.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private UpiAccountRepository upiAccountRepository;

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try {
            long totalUsers = userRepository.count();
            long successCount = transactionRepository.countByStatus(TransactionStatus.SUCCESS);
            long failedCount = transactionRepository.countByStatus(TransactionStatus.FAILED);
            long totalTransactions = successCount + failedCount;

            List<Transaction> allTransactions = transactionRepository.findAll();
            BigDecimal totalVolume = allTransactions.stream()
                    .filter(t -> t.getStatus() == TransactionStatus.SUCCESS)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double successRate = totalTransactions > 0 
                    ? ((double) successCount / totalTransactions) * 100.0 
                    : 0.0;

            BigDecimal activeLimit = systemConfigRepository.findByConfigKey("max_transaction_limit")
                    .map(c -> new BigDecimal(c.getConfigValue()))
                    .orElse(new BigDecimal("50000"));

            AdminStatsResponse stats = new AdminStatsResponse(
                    totalUsers,
                    totalVolume,
                    totalTransactions,
                    successCount,
                    failedCount,
                    successRate,
                    activeLimit
            );
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error fetching statistics: " + e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserSummaryResponse> users = userRepository.findAll().stream().map(user -> {
                long bankCount = bankAccountRepository.countByUserId(user.getId());
                long upiCount = upiAccountRepository.countByUserId(user.getId());
                return new UserSummaryResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole().name(),
                        user.isBlocked(),
                        user.getCreatedAt(),
                        bankCount,
                        upiCount
                );
            }).collect(Collectors.toList());

            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error fetching users: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{userId}/toggle-block")
    public ResponseEntity<?> toggleBlockUser(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getRole() == Role.ADMIN) {
                return ResponseEntity.badRequest().body(new MessageResponse("Cannot block admin accounts"));
            }

            user.setBlocked(!user.isBlocked());
            userRepository.save(user);

            String status = user.isBlocked() ? "blocked" : "unblocked";
            return ResponseEntity.ok(new MessageResponse("User has been successfully " + status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error updating user status: " + e.getMessage()));
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getAllTransactions() {
        try {
            List<Transaction> transactions = transactionRepository.findAllByOrderByTimestampDesc();
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error fetching transactions: " + e.getMessage()));
        }
    }

    @GetMapping("/configs")
    public ResponseEntity<?> getConfigs() {
        try {
            return ResponseEntity.ok(systemConfigRepository.findAll());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error fetching configurations: " + e.getMessage()));
        }
    }

    @PutMapping("/configs")
    public ResponseEntity<?> updateConfigs(@RequestBody Map<String, String> configs) {
        try {
            for (Map.Entry<String, String> entry : configs.entrySet()) {
                SystemConfig config = systemConfigRepository.findByConfigKey(entry.getKey())
                        .orElse(new SystemConfig(entry.getKey(), entry.getValue()));
                config.setConfigValue(entry.getValue());
                systemConfigRepository.save(config);
            }
            return ResponseEntity.ok(new MessageResponse("System configurations updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error updating configurations: " + e.getMessage()));
        }
    }
}
