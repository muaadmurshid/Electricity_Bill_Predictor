package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.DTO.HouseholdAnalyticsSummary;
import com.example.electricity_bill_predictor.DTO.CategoryConsumptionSummary;
import com.example.electricity_bill_predictor.DTO.ApplianceConsumptionSummary;
import com.example.electricity_bill_predictor.DTO.MonthlyConsumptionSummary;

import com.example.electricity_bill_predictor.Entity.DailyUsage;
import com.example.electricity_bill_predictor.Service.DailyUsageService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/daily-usage")
public class DailyUsageController {

    private final DailyUsageService dailyUsageService;

    public DailyUsageController(
            DailyUsageService dailyUsageService) {

        this.dailyUsageService =
                dailyUsageService;
    }

    // GET current user's usage records
    @GetMapping
    public ResponseEntity<List<DailyUsage>>
    getAllDailyUsage() {

        return ResponseEntity.ok(
                dailyUsageService
                        .getAllDailyUsage()
        );
    }

    // GET daily usage by ID
    @GetMapping("/{id}")
    public ResponseEntity<DailyUsage>
    getDailyUsageById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                dailyUsageService
                        .getDailyUsageById(id)
        );
    }

    // GET total household consumption
    @GetMapping(
            "/household/{householdId}/consumption"
    )
    public ResponseEntity<BigDecimal>
    getHouseholdConsumption(

            @PathVariable Long householdId,

            @RequestParam
            LocalDate startDate,

            @RequestParam
            LocalDate endDate) {

        return ResponseEntity.ok(
                dailyUsageService
                        .getHouseholdConsumption(
                                householdId,
                                startDate,
                                endDate
                        )
        );
    }

    // GET monthly household consumption
    @GetMapping(
            "/household/{householdId}/monthly-summary"
    )
    public ResponseEntity<MonthlyConsumptionSummary>
    getMonthlyConsumptionSummary(

            @PathVariable Long householdId,

            @RequestParam Integer year,

            @RequestParam Integer month) {

        return ResponseEntity.ok(
                dailyUsageService
                        .getMonthlyConsumptionSummary(
                                householdId,
                                year,
                                month
                        )
        );
    }

    // GET appliance consumption breakdown
    @GetMapping(
            "/household/{householdId}/appliance-breakdown"
    )
    public ResponseEntity<
            List<ApplianceConsumptionSummary>>
    getApplianceConsumptionBreakdown(

            @PathVariable Long householdId,

            @RequestParam
            LocalDate startDate,

            @RequestParam
            LocalDate endDate) {

        return ResponseEntity.ok(
                dailyUsageService
                        .getApplianceConsumptionBreakdown(
                                householdId,
                                startDate,
                                endDate
                        )
        );
    }

    // GET highest-consuming appliance
    @GetMapping(
            "/household/{householdId}/highest-consuming-appliance"
    )
    public ResponseEntity<
            ApplianceConsumptionSummary>
    getHighestConsumingAppliance(

            @PathVariable Long householdId,

            @RequestParam
            LocalDate startDate,

            @RequestParam
            LocalDate endDate) {

        return ResponseEntity.ok(
                dailyUsageService
                        .getHighestConsumingAppliance(
                                householdId,
                                startDate,
                                endDate
                        )
        );
    }

    // GET category consumption breakdown
    @GetMapping(
            "/household/{householdId}/category-breakdown"
    )
    public ResponseEntity<
            List<CategoryConsumptionSummary>>
    getCategoryConsumptionBreakdown(

            @PathVariable Long householdId,

            @RequestParam
            LocalDate startDate,

            @RequestParam
            LocalDate endDate) {

        return ResponseEntity.ok(
                dailyUsageService
                        .getCategoryConsumptionBreakdown(
                                householdId,
                                startDate,
                                endDate
                        )
        );
    }

    // GET complete analytics
    @GetMapping(
            "/household/{householdId}/analytics"
    )
    public ResponseEntity<
            HouseholdAnalyticsSummary>
    getHouseholdAnalyticsSummary(

            @PathVariable Long householdId,

            @RequestParam
            LocalDate startDate,

            @RequestParam
            LocalDate endDate) {

        return ResponseEntity.ok(
                dailyUsageService
                        .getHouseholdAnalyticsSummary(
                                householdId,
                                startDate,
                                endDate
                        )
        );
    }

    // CREATE daily usage
    @PostMapping
    public ResponseEntity<DailyUsage>
    createDailyUsage(

            @Valid
            @RequestBody
            DailyUsage dailyUsage) {

        return ResponseEntity.ok(
                dailyUsageService
                        .createDailyUsage(
                                dailyUsage
                        )
        );
    }

    // UPDATE daily usage
    @PutMapping("/{id}")
    public ResponseEntity<DailyUsage>
    updateDailyUsage(

            @PathVariable Long id,

            @Valid
            @RequestBody
            DailyUsage dailyUsage) {

        return ResponseEntity.ok(
                dailyUsageService
                        .updateDailyUsage(
                                id,
                                dailyUsage
                        )
        );
    }

    // DELETE daily usage
    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteDailyUsage(
            @PathVariable Long id) {

        dailyUsageService
                .deleteDailyUsage(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}