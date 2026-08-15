package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.DTO.LoginRequest;
import com.example.electricity_bill_predictor.DTO.LoginResponse;
import com.example.electricity_bill_predictor.DTO.RegisterRequest;

import com.example.electricity_bill_predictor.Entity.User;

import com.example.electricity_bill_predictor.Service.JwtService;
import com.example.electricity_bill_predictor.Service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(
            UserService userService,
            JwtService jwtService) {

        this.userService =
                userService;

        this.jwtService =
                jwtService;
    }

    // =========================================================
    // REGISTER
    // =========================================================
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(
            @Valid
            @RequestBody
            RegisterRequest request) {

        User user =
                new User();

        user.setFirstName(
                request.getFirstName()
        );

        user.setLastName(
                request.getLastName()
        );

        user.setEmail(
                request.getEmail()
        );

        user.setPassword(
                request.getPassword()
        );

        user.setAccountStatus(
                "ACTIVE"
        );

        /*
         * Public registration can NEVER
         * create an ADMIN account.
         */
        user.setRole(
                "USER"
        );

        User savedUser =
                userService.createUser(
                        user
                );

        String token =
                jwtService.generateToken(
                        savedUser.getUserId(),
                        savedUser.getEmail(),
                        savedUser.getRole()
                );

        LoginResponse response =
                new LoginResponse(

                        savedUser.getUserId(),

                        savedUser.getFirstName(),

                        savedUser.getLastName(),

                        savedUser.getEmail(),

                        savedUser.getRole(),

                        token,

                        "Bearer",

                        "Registration successful"
                );

        return ResponseEntity.ok(
                response
        );
    }

    // =========================================================
    // LOGIN
    // =========================================================
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid
            @RequestBody
            LoginRequest request) {

        User user =
                userService.authenticateUser(
                        request.getEmail(),
                        request.getPassword()
                );

        String token =
                jwtService.generateToken(
                        user.getUserId(),
                        user.getEmail(),
                        user.getRole()
                );

        LoginResponse response =
                new LoginResponse(

                        user.getUserId(),

                        user.getFirstName(),

                        user.getLastName(),

                        user.getEmail(),

                        user.getRole(),

                        token,

                        "Bearer",

                        "Login successful"
                );

        return ResponseEntity.ok(
                response
        );
    }
}