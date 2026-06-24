package com.upi.simulator.service;

import com.upi.simulator.model.Role;
import com.upi.simulator.model.SystemConfig;
import com.upi.simulator.model.User;
import com.upi.simulator.repository.SystemConfigRepository;
import com.upi.simulator.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DbInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemConfigRepository systemConfigRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed default Admin user if not exists
        if (!userRepository.existsByEmail("admin@upi.com")) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@upi.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setBlocked(false);
            userRepository.save(admin);
            System.out.println("Default Admin user (admin@upi.com / admin123) has been seeded.");
        }

        // Seed default max transaction limit configuration if not exists
        if (systemConfigRepository.findByConfigKey("max_transaction_limit").isEmpty()) {
            SystemConfig limitConfig = new SystemConfig("max_transaction_limit", "50000");
            systemConfigRepository.save(limitConfig);
            System.out.println("Default max transaction limit configuration seeded (50000).");
        }
    }
}
