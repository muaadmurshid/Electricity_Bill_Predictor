package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.DTO.HouseholdAnalyticsSummary;
import com.example.electricity_bill_predictor.DTO.CategoryConsumptionSummary;
import com.example.electricity_bill_predictor.DTO.ApplianceConsumptionSummary;
import com.example.electricity_bill_predictor.DTO.MonthlyConsumptionSummary;
import com.example.electricity_bill_predictor.Entity.Appliance;
import com.example.electricity_bill_predictor.Entity.DailyUsage;
import com.example.electricity_bill_predictor.Repository.ApplianceRepository;
import com.example.electricity_bill_predictor.Repository.DailyUsageRepository;
import com.example.electricity_bill_predictor.Repository.HouseholdRepository;
import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DailyUsageService {

    private final DailyUsageRepository dailyUsageRepository;
    private final ApplianceRepository applianceRepository;
    private final HouseholdRepository householdRepository;

    public DailyUsageService(
            DailyUsageRepository dailyUsageRepository,
            ApplianceRepository applianceRepository,
            HouseholdRepository householdRepository) {

        this.dailyUsageRepository = dailyUsageRepository;
        this.applianceRepository = applianceRepository;
        this.householdRepository = householdRepository;
    }

    // Get all daily usage records
    public List<DailyUsage> getAllDailyUsage() {
        return dailyUsageRepository.findAll();
    }

    // Get daily usage by ID
    public DailyUsage getDailyUsageById(Long id) {

        return dailyUsageRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Daily usage not found with id: " + id
                        )
                );
    }

    // Create daily usage
    public DailyUsage createDailyUsage(DailyUsage dailyUsage) {

        Long applianceId =
                dailyUsage.getAppliance().getApplianceId();

        Appliance appliance =
                applianceRepository.findById(applianceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appliance not found with id: "
                                                + applianceId
                                )
                        );

        dailyUsage.setAppliance(appliance);

        // Automatically calculate electricity consumption
        BigDecimal estimatedConsumptionKwh =
                calculateConsumption(
                        appliance,
                        dailyUsage.getHoursUsed()
                );

        dailyUsage.setEstimatedConsumptionKwh(
                estimatedConsumptionKwh
        );

        return dailyUsageRepository.save(dailyUsage);
    }

    // Update daily usage
    public DailyUsage updateDailyUsage(
            Long usageId,
            DailyUsage dailyUsageDetails) {

        DailyUsage existingDailyUsage =
                dailyUsageRepository.findById(usageId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Daily usage not found with id: "
                                                + usageId
                                )
                        );

        Long applianceId =
                dailyUsageDetails
                        .getAppliance()
                        .getApplianceId();

        Appliance appliance =
                applianceRepository.findById(applianceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appliance not found with id: "
                                                + applianceId
                                )
                        );

        existingDailyUsage.setAppliance(appliance);

        existingDailyUsage.setUsageDate(
                dailyUsageDetails.getUsageDate()
        );

        existingDailyUsage.setHoursUsed(
                dailyUsageDetails.getHoursUsed()
        );

        // Automatically recalculate consumption
        BigDecimal estimatedConsumptionKwh =
                calculateConsumption(
                        appliance,
                        dailyUsageDetails.getHoursUsed()
                );

        existingDailyUsage.setEstimatedConsumptionKwh(
                estimatedConsumptionKwh
        );

        existingDailyUsage.setUsageNotes(
                dailyUsageDetails.getUsageNotes()
        );

        return dailyUsageRepository.save(existingDailyUsage);
    }

    // Delete daily usage
    public void deleteDailyUsage(Long usageId) {

        DailyUsage existingDailyUsage =
                dailyUsageRepository.findById(usageId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Daily usage not found with id: "
                                                + usageId
                                )
                        );

        dailyUsageRepository.delete(existingDailyUsage);
    }

    // Calculate appliance electricity consumption in kWh
    private BigDecimal calculateConsumption(
            Appliance appliance,
            BigDecimal hoursUsed) {

        BigDecimal ratedPower =
                appliance.getRatedPower();

        BigDecimal quantity =
                BigDecimal.valueOf(
                        appliance.getQuantity()
                );

        return ratedPower
                .multiply(hoursUsed)
                .multiply(quantity)
                .divide(
                        BigDecimal.valueOf(1000),
                        3,
                        RoundingMode.HALF_UP
                );
    }

    // Calculate total household consumption for a date range
    public BigDecimal getHouseholdConsumption(
            Long householdId,
            LocalDate startDate,
            LocalDate endDate) {

        // Check household exists
        householdRepository.findById(householdId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Household not found with id: "
                                        + householdId
                        )
                );

        // Check dates are provided
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        // Check date range is valid
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }

        List<DailyUsage> usageRecords =
                dailyUsageRepository
                        .findByApplianceRoomHouseholdHouseholdIdAndUsageDateBetween(
                                householdId,
                                startDate,
                                endDate
                        );

        return usageRecords.stream()
                .map(DailyUsage::getEstimatedConsumptionKwh)
                .filter(consumption -> consumption != null)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }

    // Get monthly household consumption summary
    public MonthlyConsumptionSummary getMonthlyConsumptionSummary(
            Long householdId,
            Integer year,
            Integer month) {

        // Check household exists
        householdRepository.findById(householdId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Household not found with id: "
                                        + householdId
                        )
                );

        // Validate year
        if (year == null || year < 2000) {
            throw new IllegalArgumentException(
                    "Invalid year"
            );
        }

        // Validate month
        if (month == null || month < 1 || month > 12) {
            throw new IllegalArgumentException(
                    "Month must be between 1 and 12"
            );
        }

        LocalDate startDate =
                LocalDate.of(year, month, 1);

        LocalDate endDate =
                startDate.withDayOfMonth(
                        startDate.lengthOfMonth()
                );

        BigDecimal totalConsumption =
                getHouseholdConsumption(
                        householdId,
                        startDate,
                        endDate
                );

        return new MonthlyConsumptionSummary(
                householdId,
                year,
                month,
                startDate,
                endDate,
                totalConsumption
        );
    }

    // Get appliance-wise consumption breakdown
    public List<ApplianceConsumptionSummary> getApplianceConsumptionBreakdown(
            Long householdId,
            LocalDate startDate,
            LocalDate endDate) {

        // Check household exists
        householdRepository.findById(householdId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Household not found with id: "
                                        + householdId
                        )
                );

        // Validate dates
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }

        List<DailyUsage> usageRecords =
                dailyUsageRepository
                        .findByApplianceRoomHouseholdHouseholdIdAndUsageDateBetween(
                                householdId,
                                startDate,
                                endDate
                        );

        // Group consumption by appliance
        Map<Long, BigDecimal> consumptionByAppliance =
                usageRecords.stream()
                        .filter(usage ->
                                usage.getEstimatedConsumptionKwh() != null
                        )
                        .collect(
                                Collectors.groupingBy(
                                        usage ->
                                                usage.getAppliance()
                                                        .getApplianceId(),
                                        Collectors.reducing(
                                                BigDecimal.ZERO,
                                                DailyUsage::getEstimatedConsumptionKwh,
                                                BigDecimal::add
                                        )
                                )
                        );

        // Calculate total household consumption
        BigDecimal totalHouseholdConsumption =
                consumptionByAppliance.values()
                        .stream()
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        List<ApplianceConsumptionSummary> result =
                new ArrayList<>();

        for (Map.Entry<Long, BigDecimal> entry :
                consumptionByAppliance.entrySet()) {

            Long applianceId = entry.getKey();
            BigDecimal applianceConsumption =
                    entry.getValue();

            Appliance appliance =
                    applianceRepository.findById(applianceId)
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Appliance not found with id: "
                                                    + applianceId
                                    )
                            );

            // Calculate percentage share
            BigDecimal percentageShare =
                    BigDecimal.ZERO;

            if (totalHouseholdConsumption.compareTo(
                    BigDecimal.ZERO) > 0) {

                percentageShare =
                        applianceConsumption
                                .divide(
                                        totalHouseholdConsumption,
                                        6,
                                        RoundingMode.HALF_UP
                                )
                                .multiply(
                                        BigDecimal.valueOf(100)
                                )
                                .setScale(
                                        2,
                                        RoundingMode.HALF_UP
                                );
            }

            ApplianceConsumptionSummary summary =
                    new ApplianceConsumptionSummary(
                            applianceId,
                            appliance.getApplianceName(),
                            applianceConsumption,
                            percentageShare
                    );

            result.add(summary);
        }

        // Highest consuming appliance first
        result.sort(
                Comparator.comparing(
                        ApplianceConsumptionSummary::getTotalConsumptionKwh
                ).reversed()
        );

        return result;
    }

    // Get highest consuming appliance
    public ApplianceConsumptionSummary getHighestConsumingAppliance(
            Long householdId,
            LocalDate startDate,
            LocalDate endDate) {

        List<ApplianceConsumptionSummary> breakdown =
                getApplianceConsumptionBreakdown(
                        householdId,
                        startDate,
                        endDate
                );

        if (breakdown.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No appliance consumption data found for the selected period"
            );
        }

        return breakdown.get(0);
    }
    public List<CategoryConsumptionSummary> getCategoryConsumptionBreakdown(
            Long householdId,
            LocalDate startDate,
            LocalDate endDate) {

        // Check household exists
        householdRepository.findById(householdId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Household not found with id: "
                                        + householdId
                        )
                );

        // Validate dates
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }

        List<DailyUsage> usageRecords =
                dailyUsageRepository
                        .findByApplianceRoomHouseholdHouseholdIdAndUsageDateBetween(
                                householdId,
                                startDate,
                                endDate
                        );

        // Group consumption by category
        Map<Long, BigDecimal> consumptionByCategory =
                usageRecords.stream()
                        .filter(usage ->
                                usage.getEstimatedConsumptionKwh() != null
                        )
                        .collect(
                                Collectors.groupingBy(
                                        usage ->
                                                usage.getAppliance()
                                                        .getCategory()
                                                        .getCategoryId(),
                                        Collectors.reducing(
                                                BigDecimal.ZERO,
                                                DailyUsage::getEstimatedConsumptionKwh,
                                                BigDecimal::add
                                        )
                                )
                        );

        // Calculate total household consumption
        BigDecimal totalHouseholdConsumption =
                consumptionByCategory.values()
                        .stream()
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        List<CategoryConsumptionSummary> result =
                new ArrayList<>();

        for (Map.Entry<Long, BigDecimal> entry :
                consumptionByCategory.entrySet()) {

            Long categoryId = entry.getKey();
            BigDecimal categoryConsumption =
                    entry.getValue();

            String categoryName =
                    usageRecords.stream()
                            .map(DailyUsage::getAppliance)
                            .filter(appliance ->
                                    appliance.getCategory()
                                            .getCategoryId()
                                            .equals(categoryId)
                            )
                            .findFirst()
                            .map(appliance ->
                                    appliance.getCategory()
                                            .getCategoryName()
                            )
                            .orElse("Unknown");

            BigDecimal percentageShare =
                    BigDecimal.ZERO;

            if (totalHouseholdConsumption.compareTo(
                    BigDecimal.ZERO) > 0) {

                percentageShare =
                        categoryConsumption
                                .divide(
                                        totalHouseholdConsumption,
                                        6,
                                        RoundingMode.HALF_UP
                                )
                                .multiply(
                                        BigDecimal.valueOf(100)
                                )
                                .setScale(
                                        2,
                                        RoundingMode.HALF_UP
                                );
            }

            CategoryConsumptionSummary summary =
                    new CategoryConsumptionSummary(
                            categoryId,
                            categoryName,
                            categoryConsumption,
                            percentageShare
                    );

            result.add(summary);
        }

        // Highest consuming category first
        result.sort(
                Comparator.comparing(
                        CategoryConsumptionSummary::getTotalConsumptionKwh
                ).reversed()
        );

        return result;
    }
    public HouseholdAnalyticsSummary getHouseholdAnalyticsSummary(
            Long householdId,
            LocalDate startDate,
            LocalDate endDate) {

        // Check household exists
        householdRepository.findById(householdId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Household not found with id: "
                                        + householdId
                        )
                );

        // Validate dates
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }

        BigDecimal totalConsumption =
                getHouseholdConsumption(
                        householdId,
                        startDate,
                        endDate
                );

        List<ApplianceConsumptionSummary> applianceBreakdown =
                getApplianceConsumptionBreakdown(
                        householdId,
                        startDate,
                        endDate
                );

        List<CategoryConsumptionSummary> categoryBreakdown =
                getCategoryConsumptionBreakdown(
                        householdId,
                        startDate,
                        endDate
                );

        ApplianceConsumptionSummary highestConsumingAppliance = null;

        if (!applianceBreakdown.isEmpty()) {
            highestConsumingAppliance =
                    applianceBreakdown.get(0);
        }

        return new HouseholdAnalyticsSummary(
                householdId,
                startDate,
                endDate,
                totalConsumption,
                highestConsumingAppliance,
                applianceBreakdown,
                categoryBreakdown
        );
    }
}