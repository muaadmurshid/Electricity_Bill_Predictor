package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.DTO.HouseholdAnalyticsSummary;
import com.example.electricity_bill_predictor.DTO.CategoryConsumptionSummary;
import com.example.electricity_bill_predictor.DTO.ApplianceConsumptionSummary;
import com.example.electricity_bill_predictor.DTO.MonthlyConsumptionSummary;
import jakarta.validation.Valid;

import com.example.electricity_bill_predictor.Entity.DailyUsage;
import com.example.electricity_bill_predictor.Service.DailyUsageService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/daily-usage")
@CrossOrigin(origins = "*")
public class DailyUsageController {

    private final DailyUsageService dailyUsageService;

    public DailyUsageController(DailyUsageService dailyUsageService) {
        this.dailyUsageService = dailyUsageService;
    }

    // GET all daily usage records
    @GetMapping
    public List<DailyUsage> getAllDailyUsage() {
        return dailyUsageService.getAllDailyUsage();
    }

    // GET daily usage by ID
    @GetMapping("/{id}")
    public ResponseEntity<DailyUsage> getDailyUsageById(
            @PathVariable Long id) {

        DailyUsage dailyUsage =
                dailyUsageService.getDailyUsageById(id);

        return ResponseEntity.ok(dailyUsage);
    }

    // GET total household consumption for a date range
    @GetMapping("/household/{householdId}/consumption")
    public ResponseEntity<BigDecimal> getHouseholdConsumption(
            @PathVariable Long householdId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {

        BigDecimal totalConsumption =
                dailyUsageService.getHouseholdConsumption(
                        householdId,
                        startDate,
                        endDate
                );

        return ResponseEntity.ok(totalConsumption);
    }
    // GET monthly household consumption summary
    @GetMapping("/household/{householdId}/monthly-summary")
    public ResponseEntity<MonthlyConsumptionSummary> getMonthlyConsumptionSummary(
            @PathVariable Long householdId,
            @RequestParam Integer year,
            @RequestParam Integer month) {

        MonthlyConsumptionSummary summary =
                dailyUsageService.getMonthlyConsumptionSummary(
                        householdId,
                        year,
                        month
                );

        return ResponseEntity.ok(summary);
    }
    // GET appliance-wise consumption breakdown
    @GetMapping("/household/{householdId}/appliance-breakdown")
    public ResponseEntity<List<ApplianceConsumptionSummary>>
    getApplianceConsumptionBreakdown(
            @PathVariable Long householdId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {

        List<ApplianceConsumptionSummary> breakdown =
                dailyUsageService.getApplianceConsumptionBreakdown(
                        householdId,
                        startDate,
                        endDate
                );

        return ResponseEntity.ok(breakdown);
    }
    // GET highest consuming appliance
    @GetMapping("/household/{householdId}/highest-consuming-appliance")
    public ResponseEntity<ApplianceConsumptionSummary>
    getHighestConsumingAppliance(
            @PathVariable Long householdId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {

        ApplianceConsumptionSummary highestConsumer =
                dailyUsageService.getHighestConsumingAppliance(
                        householdId,
                        startDate,
                        endDate
                );

        return ResponseEntity.ok(highestConsumer);
    }
    // GET category-wise consumption breakdown
    @GetMapping("/household/{householdId}/category-breakdown")
    public ResponseEntity<List<CategoryConsumptionSummary>>
    getCategoryConsumptionBreakdown(
            @PathVariable Long householdId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {

        List<CategoryConsumptionSummary> breakdown =
                dailyUsageService.getCategoryConsumptionBreakdown(
                        householdId,
                        startDate,
                        endDate
                );

        return ResponseEntity.ok(breakdown);
    }

    // GET combined household analytics summary
    @GetMapping("/household/{householdId}/analytics")
    public ResponseEntity<HouseholdAnalyticsSummary>
    getHouseholdAnalyticsSummary(
            @PathVariable Long householdId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {

        HouseholdAnalyticsSummary summary =
                dailyUsageService.getHouseholdAnalyticsSummary(
                        householdId,
                        startDate,
                        endDate
                );

        return ResponseEntity.ok(summary);
    }

    // CREATE daily usage
    @PostMapping
    public ResponseEntity<DailyUsage> createDailyUsage(
            @Valid @RequestBody DailyUsage dailyUsage) {

        DailyUsage createdDailyUsage =
                dailyUsageService.createDailyUsage(dailyUsage);

        return ResponseEntity.ok(createdDailyUsage);
    }

    // UPDATE daily usage
    @PutMapping("/{id}")
    public ResponseEntity<DailyUsage> updateDailyUsage(
            @PathVariable Long id,
            @Valid @RequestBody DailyUsage dailyUsage) {

        DailyUsage updatedDailyUsage =
                dailyUsageService.updateDailyUsage(
                        id,
                        dailyUsage
                );

        return ResponseEntity.ok(updatedDailyUsage);
    }

    // DELETE daily usage
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDailyUsage(
            @PathVariable Long id) {

        dailyUsageService.deleteDailyUsage(id);

        return ResponseEntity.noContent().build();
    }
}