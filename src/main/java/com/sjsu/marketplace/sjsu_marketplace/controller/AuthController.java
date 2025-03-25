package com.sjsu.marketplace.sjsu_marketplace.controller;

import com.sjsu.marketplace.sjsu_marketplace.model.User;
import com.sjsu.marketplace.sjsu_marketplace.repository.UserRepository;
import com.sjsu.marketplace.sjsu_marketplace.security.JwtTokenUtil;
import com.sjsu.marketplace.sjsu_marketplace.service.CustomUserDetailsService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody User user) {
        try {
            logger.info("Attempting to register user: {}", user.getUsername());
            
            // Check if username exists
            if (userRepository.existsByUsername(user.getUsername())) {
                logger.warn("Username already exists: {}", user.getUsername());
                return ResponseEntity.badRequest().body("Username is already taken!");
            }

            // Check if email exists
            if (userRepository.existsByEmail(user.getEmail())) {
                logger.warn("Email already exists: {}", user.getEmail());
                return ResponseEntity.badRequest().body("Email is already in use!");
            }

            // Validate SJSU email
            if (!user.getEmail().endsWith("@sjsu.edu")) {
                logger.warn("Invalid email domain: {}", user.getEmail());
                return ResponseEntity.badRequest().body("Only SJSU email addresses are allowed!");
            }

            // Create new user
            String rawPassword = user.getPassword();
            String encodedPassword = passwordEncoder.encode(rawPassword);
            user.setPassword(encodedPassword);
            
            User savedUser = userRepository.save(user);
            logger.info("User registered successfully: {}", savedUser.getUsername());
            
            return ResponseEntity.ok("User registered successfully with ID: " + savedUser.getId());
        } catch (Exception e) {
            logger.error("Error registering user: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error registering user: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        try {
            String username = loginRequest.get("username");
            String password = loginRequest.get("password");
            logger.info("Attempting login for user: {}", username);

            // Check if user exists
            if (!userRepository.existsByUsername(username)) {
                logger.warn("Login failed: user not found: {}", username);
                return ResponseEntity.badRequest().body("Invalid username or password");
            }

            try {
                Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
                );
                logger.debug("Authentication successful for user: {}", username);

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                String token = jwtTokenUtil.generateToken(userDetails);

                Map<String, String> response = new HashMap<>();
                response.put("token", token);
                response.put("username", userDetails.getUsername());

                logger.info("Login successful for user: {}", username);
                return ResponseEntity.ok(response);
            } catch (BadCredentialsException e) {
                logger.warn("Login failed: invalid credentials for user: {}", username);
                return ResponseEntity.badRequest().body("Invalid username or password");
            }
        } catch (Exception e) {
            logger.error("Login error: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error during login: " + e.getMessage());
        }
    }
} 