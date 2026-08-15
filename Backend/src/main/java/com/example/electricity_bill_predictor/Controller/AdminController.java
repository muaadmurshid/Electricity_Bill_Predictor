package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.DTO.AdminDashboardSummary;
import com.example.electricity_bill_predictor.Service.AdminService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(
            AdminService adminService) {

        this.adminService =
                adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardSummary>
    getDashboardSummary() {

        return ResponseEntity.ok(
                adminService.getDashboardSummary()
        );
    }
}