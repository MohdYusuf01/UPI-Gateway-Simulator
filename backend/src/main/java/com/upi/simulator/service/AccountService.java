package com.upi.simulator.service;

import com.upi.simulator.model.BankAccount;
import com.upi.simulator.model.UpiAccount;
import com.upi.simulator.model.User;
import com.upi.simulator.payload.request.AddBankRequest;
import com.upi.simulator.payload.request.CreateUpiRequest;
import com.upi.simulator.payload.response.AccountResponse;
import com.upi.simulator.payload.response.UpiResponse;
import com.upi.simulator.repository.BankAccountRepository;
import com.upi.simulator.repository.UpiAccountRepository;
import com.upi.simulator.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccountService {

    @Autowired
    private BankAccountRepository bankAccountRepository;

    @Autowired
    private UpiAccountRepository upiAccountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public AccountResponse addBankAccount(AddBankRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (bankAccountRepository.existsByAccountNumber(request.getAccountNumber())) {
            throw new RuntimeException("Account number already linked");
        }

        BigDecimal initialBalance = request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO;

        BankAccount account = new BankAccount(
                request.getAccountNumber(),
                request.getIfsc(),
                request.getBankName(),
                initialBalance,
                user
        );

        BankAccount savedAccount = bankAccountRepository.save(account);

        return new AccountResponse(
                savedAccount.getId(),
                savedAccount.getAccountNumber(),
                savedAccount.getIfsc(),
                savedAccount.getBankName(),
                savedAccount.getBalance()
        );
    }

    public List<AccountResponse> getUserBankAccounts(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return bankAccountRepository.findByUserId(user.getId()).stream()
                .map(acc -> new AccountResponse(acc.getId(), acc.getAccountNumber(), acc.getIfsc(), acc.getBankName(), acc.getBalance()))
                .collect(Collectors.toList());
    }

    @Transactional
    public UpiResponse createUpiId(CreateUpiRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BankAccount bankAccount = bankAccountRepository.findById(request.getBankAccountId())
                .orElseThrow(() -> new RuntimeException("Bank account not found"));

        if (!bankAccount.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bank account does not belong to user");
        }

        if (upiAccountRepository.existsByBankAccountId(bankAccount.getId())) {
             throw new RuntimeException("Bank account already has a UPI ID");
        }

        if (upiAccountRepository.existsByUpiId(request.getUpiId())) {
            throw new RuntimeException("UPI ID already exists. Please choose another one.");
        }

        UpiAccount upiAccount = new UpiAccount(
                request.getUpiId(),
                passwordEncoder.encode(request.getTransactionPin()),
                bankAccount,
                user
        );

        UpiAccount savedUpi = upiAccountRepository.save(upiAccount);

        return new UpiResponse(savedUpi.getId(), savedUpi.getUpiId(), bankAccount.getId());
    }

    public List<UpiResponse> getUserUpiIds(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return upiAccountRepository.findByUserId(user.getId()).stream()
                .map(upi -> new UpiResponse(upi.getId(), upi.getUpiId(), upi.getBankAccount().getId()))
                .collect(Collectors.toList());
    }
}
