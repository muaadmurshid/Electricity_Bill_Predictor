package com.example.electricity_bill_predictor.DTO;

import jakarta.validation.constraints.NotBlank;

public class UserStatusRequest {

    @NotBlank(message = "Account status is required")
    private String accountStatus;

    public UserStatusRequest() {
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(
            String accountStatus) {

        this.accountStatus = accountStatus;
    }
}