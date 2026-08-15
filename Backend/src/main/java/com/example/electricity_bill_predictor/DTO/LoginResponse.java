package com.example.electricity_bill_predictor.DTO;

public class LoginResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String token;
    private String tokenType;
    private String message;

    public LoginResponse() {
    }

    public LoginResponse(
            Long userId,
            String firstName,
            String lastName,
            String email,
            String role,
            String token,
            String tokenType,
            String message) {

        this.userId =
                userId;

        this.firstName =
                firstName;

        this.lastName =
                lastName;

        this.email =
                email;

        this.role =
                role;

        this.token =
                token;

        this.tokenType =
                tokenType;

        this.message =
                message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(
            Long userId) {

        this.userId =
                userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(
            String firstName) {

        this.firstName =
                firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(
            String lastName) {

        this.lastName =
                lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(
            String email) {

        this.email =
                email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(
            String role) {

        this.role =
                role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(
            String token) {

        this.token =
                token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(
            String tokenType) {

        this.tokenType =
                tokenType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(
            String message) {

        this.message =
                message;
    }
}