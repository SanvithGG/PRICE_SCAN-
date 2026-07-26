package com.example.backend.service;

import com.example.backend.dto.AuthRequest;
import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.SignupRequest;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            // Auto register guest or check password
            User newUser = User.builder()
                    .name(email.split("@")[0])
                    .email(email)
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role("USER")
                    .build();
            userRepository.save(newUser);
            return AuthResponse.builder()
                    .success(true)
                    .message("Welcome! Account created automatically.")
                    .user(newUser.getName())
                    .email(newUser.getEmail())
                    .build();
        }

        User user = userOpt.get();
        if (passwordEncoder.matches(request.getPassword(), user.getPassword()) || request.getPassword().equals(user.getPassword())) {
            return AuthResponse.builder()
                    .success(true)
                    .message("Welcome back!")
                    .user(user.getName())
                    .email(user.getEmail())
                    .build();
        }

        return AuthResponse.builder()
                .success(false)
                .message("Invalid email or password.")
                .build();
    }

    public AuthResponse signup(SignupRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            return AuthResponse.builder()
                    .success(false)
                    .message("An account with this email already exists.")
                    .build();
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER")
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .success(true)
                .message("Account created successfully!")
                .user(user.getName())
                .email(user.getEmail())
                .build();
    }
}
