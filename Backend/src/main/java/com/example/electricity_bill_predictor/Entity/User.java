package com.example.electricity_bill_predictor.Entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @NotBlank(message = "First name is required")
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    @Column(
            name = "email",
            nullable = false,
            unique = true
    )
    private String email;

    @NotBlank(message = "Password is required")
    @Size(
            min = 8,
            message = "Password must contain at least 8 characters"
    )
    @JsonProperty(
            access = JsonProperty.Access.WRITE_ONLY
    )
    @Column(
            name = "password",
            nullable = false
    )
    private String password;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(
            name = "created_date",
            nullable = false
    )
    private LocalDateTime createdDate;

    @Column(
            name = "account_status",
            nullable = false
    )
    private String accountStatus;

    // =========================================================
    // USER ROLE
    // USER  = normal residential user
    // ADMIN = system administrator
    // =========================================================
    @Column(
            name = "role",
            nullable = false,
            length = 20
    )
    private String role;

    // =========================================================
    // DEFAULT VALUES
    // =========================================================
    @PrePersist
    protected void onCreate() {

        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }

        if (accountStatus == null ||
                accountStatus.isBlank()) {

            accountStatus = "ACTIVE";
        }

        if (role == null ||
                role.isBlank()) {

            role = "USER";
        }
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getUserId() {
        return userId;
    }

    public void setUserId(
            Long userId) {

        this.userId = userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(
            String firstName) {

        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(
            String lastName) {

        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(
            String email) {

        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(
            String password) {

        this.password = password;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(
            String phoneNumber) {

        this.phoneNumber = phoneNumber;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(
            LocalDateTime createdDate) {

        this.createdDate = createdDate;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(
            String accountStatus) {

        this.accountStatus =
                accountStatus;
    }

    public String getRole() {
        return role;
    }

    public void setRole(
            String role) {

        this.role = role;
    }

    /*
     * Kept for compatibility with existing code.
     * Previously this method was empty.
     */
    public void setStatus(
            String status) {

        this.accountStatus =
                status;
    }
}