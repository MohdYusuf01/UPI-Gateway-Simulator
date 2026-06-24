package com.upi.simulator.controller;

import com.upi.simulator.payload.request.SendMoneyRequest;
import com.upi.simulator.payload.response.MessageResponse;
import com.upi.simulator.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/send")
    public ResponseEntity<?> sendMoney(@Valid @RequestBody SendMoneyRequest request, Authentication authentication) {
        try {
            return ResponseEntity.ok(transactionService.processPayment(request, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getTransactionHistory(Authentication authentication) {
        try {
            return ResponseEntity.ok(transactionService.getTransactionHistory(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
