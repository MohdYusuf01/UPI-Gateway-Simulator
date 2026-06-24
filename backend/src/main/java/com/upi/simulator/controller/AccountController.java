package com.upi.simulator.controller;

import com.upi.simulator.payload.request.AddBankRequest;
import com.upi.simulator.payload.request.CreateUpiRequest;
import com.upi.simulator.payload.response.MessageResponse;
import com.upi.simulator.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @PostMapping("/bank")
    public ResponseEntity<?> addBankAccount(@Valid @RequestBody AddBankRequest request, Authentication authentication) {
        try {
            return ResponseEntity.ok(accountService.addBankAccount(request, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/bank")
    public ResponseEntity<?> getBankAccounts(Authentication authentication) {
        try {
            return ResponseEntity.ok(accountService.getUserBankAccounts(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/upi")
    public ResponseEntity<?> createUpiId(@Valid @RequestBody CreateUpiRequest request, Authentication authentication) {
        try {
            return ResponseEntity.ok(accountService.createUpiId(request, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/upi")
    public ResponseEntity<?> getUpiIds(Authentication authentication) {
        try {
            return ResponseEntity.ok(accountService.getUserUpiIds(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
