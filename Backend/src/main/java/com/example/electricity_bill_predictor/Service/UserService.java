package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.Entity.User;
import com.example.electricity_bill_predictor.Repository.UserRepository;
import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + id
                        )
                );
    }

    public User createUser(User user) {

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        return userRepository.save(user);
    }

    public User updateUser(
            Long userId,
            User userDetails) {

        User existingUser =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found with id: " + userId
                                )
                        );

        existingUser.setFirstName(
                userDetails.getFirstName()
        );

        existingUser.setLastName(
                userDetails.getLastName()
        );

        existingUser.setEmail(
                userDetails.getEmail()
        );

        if (userDetails.getPassword() != null
                && !userDetails.getPassword().isBlank()) {

            existingUser.setPassword(
                    passwordEncoder.encode(
                            userDetails.getPassword()
                    )
            );
        }

        existingUser.setPhoneNumber(
                userDetails.getPhoneNumber()
        );

        existingUser.setAccountStatus(
                userDetails.getAccountStatus()
        );

        return userRepository.save(
                existingUser
        );
    }
    public User updateAccountStatus(
            Long userId,
            String accountStatus) {

        User existingUser =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found with id: "
                                                + userId
                                )
                        );

        if (accountStatus == null ||
                accountStatus.isBlank()) {

            throw new IllegalArgumentException(
                    "Account status is required"
            );
        }

        String normalizedStatus =
                accountStatus.toUpperCase();

        if (!normalizedStatus.equals("ACTIVE") &&
                !normalizedStatus.equals("INACTIVE")) {

            throw new IllegalArgumentException(
                    "Account status must be ACTIVE or INACTIVE"
            );
        }

        existingUser.setAccountStatus(
                normalizedStatus
        );

        return userRepository.save(
                existingUser
        );
    }

    public void deleteUser(
            Long userId) {

        User existingUser =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found with id: " + userId
                                )
                        );

        userRepository.delete(
                existingUser
        );
    }
    public User authenticateUser(
            String email,
            String rawPassword) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid email or password"
                                )
                        );

        if (!"ACTIVE".equalsIgnoreCase(
                user.getAccountStatus())) {

            throw new IllegalArgumentException(
                    "User account is not active"
            );
        }

        if (!passwordEncoder.matches(
                rawPassword,
                user.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        return user;
    }
}