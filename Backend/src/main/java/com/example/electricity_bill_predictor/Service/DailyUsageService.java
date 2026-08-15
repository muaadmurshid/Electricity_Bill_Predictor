package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.DTO.HouseholdAnalyticsSummary;
import com.example.electricity_bill_predictor.DTO.CategoryConsumptionSummary;
import com.example.electricity_bill_predictor.DTO.ApplianceConsumptionSummary;
import com.example.electricity_bill_predictor.DTO.MonthlyConsumptionSummary;

import com.example.electricity_bill_predictor.Entity.Appliance;
import com.example.electricity_bill_predictor.Entity.DailyUsage;
import com.example.electricity_bill_predictor.Entity.Household;

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
    private final CurrentUserService currentUserService;

    public DailyUsageService(
            DailyUsageRepository dailyUsageRepository,
            ApplianceRepository applianceRepository,
            HouseholdRepository householdRepository,
            CurrentUserService currentUserService) {

        this.dailyUsageRepository =
                dailyUsageRepository;

        this.applianceRepository =
                applianceRepository;

        this.householdRepository =
                householdRepository;

        this.currentUserService =
                currentUserService;
    }

    // =========================================================
    // GET ALL DAILY USAGE
    // Only records belonging to logged-in user
    // =========================================================
    public List<DailyUsage> getAllDailyUsage() {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        return dailyUsageRepository
                .findByApplianceRoomHouseholdUserUserId(
                        currentUserId
                );
    }

    // =========================================================
    // GET DAILY USAGE BY ID
    // Only owner can access
    // =========================================================
    public DailyUsage getDailyUsageById(
            Long usageId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        DailyUsage dailyUsage =
                dailyUsageRepository
                        .findById(usageId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Daily usage not found with id: "
                                                + usageId
                                )
                        );

        validateDailyUsageOwnership(
                dailyUsage,
                currentUserId
        );

        return dailyUsage;
    }

    // =========================================================
    // CREATE DAILY USAGE
    // Appliance must belong to logged-in user
    // =========================================================
    public DailyUsage createDailyUsage(
            DailyUsage dailyUsage) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        if (dailyUsage.getAppliance() == null ||
                dailyUsage
                        .getAppliance()
                        .getApplianceId() == null) {

            throw new IllegalArgumentException(
                    "Appliance is required"
            );
        }

        Long applianceId =
                dailyUsage
                        .getAppliance()
                        .getApplianceId();

        Appliance appliance =
                getOwnedAppliance(
                        applianceId,
                        currentUserId
                );

        dailyUsage.setAppliance(
                appliance
        );

        // Automatically calculate electricity consumption
        BigDecimal estimatedConsumptionKwh =
                calculateConsumption(
                        appliance,
                        dailyUsage.getHoursUsed()
                );

        dailyUsage.setEstimatedConsumptionKwh(
                estimatedConsumptionKwh
        );

        return dailyUsageRepository.save(
                dailyUsage
        );
    }

    // =========================================================
    // UPDATE DAILY USAGE
    // Existing record must belong to current user
    // New appliance must also belong to current user
    // =========================================================
    public DailyUsage updateDailyUsage(
            Long usageId,
            DailyUsage dailyUsageDetails) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        DailyUsage existingDailyUsage =
                dailyUsageRepository
                        .findById(usageId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Daily usage not found with id: "
                                                + usageId
                                )
                        );

        // Verify ownership of existing record
        validateDailyUsageOwnership(
                existingDailyUsage,
                currentUserId
        );

        if (dailyUsageDetails.getAppliance() == null ||
                dailyUsageDetails
                        .getAppliance()
                        .getApplianceId() == null) {

            throw new IllegalArgumentException(
                    "Appliance is required"
            );
        }

        Long applianceId =
                dailyUsageDetails
                        .getAppliance()
                        .getApplianceId();

        // Verify that the requested appliance
        // also belongs to current user
        Appliance appliance =
                getOwnedAppliance(
                        applianceId,
                        currentUserId
                );

        existingDailyUsage.setAppliance(
                appliance
        );

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

        existingDailyUsage
                .setEstimatedConsumptionKwh(
                        estimatedConsumptionKwh
                );

        existingDailyUsage.setUsageNotes(
                dailyUsageDetails.getUsageNotes()
        );

        return dailyUsageRepository.save(
                existingDailyUsage
        );
    }

    // =========================================================
    // DELETE DAILY USAGE
    // Only owner can delete
    // =========================================================
    public void deleteDailyUsage(
            Long usageId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        DailyUsage existingDailyUsage =
                dailyUsageRepository
                        .findById(usageId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Daily usage not found with id: "
                                                + usageId
                                )
                        );

        validateDailyUsageOwnership(
                existingDailyUsage,
                currentUserId
        );

        dailyUsageRepository.delete(
                existingDailyUsage
        );
    }

    // =========================================================
    // CALCULATE APPLIANCE CONSUMPTION
    // kWh = watts × hours × quantity / 1000
    // =========================================================
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

    // =========================================================
    // HOUSEHOLD CONSUMPTION
    // Household must belong to current user
    // =========================================================
    public BigDecimal getHouseholdConsumption(
            Long householdId,
            LocalDate startDate,
            LocalDate endDate) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        getOwnedHousehold(
                householdId,
                currentUserId
        );

        validateDateRange(
                startDate,
                endDate
        );

        List<DailyUsage> usageRecords =
                dailyUsageRepository
                        .findByApplianceRoomHouseholdHouseholdIdAndUsageDateBetween(
                                householdId,
                                startDate,
                                endDate
                        );

        return usageRecords.stream()
                .map(
                        DailyUsage::
                                getEstimatedConsumptionKwh
                )
                .filter(
                        consumption ->
                                consumption != null
                )
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }

    // =========================================================
    // MONTHLY HOUSEHOLD CONSUMPTION
    // =========================================================
    public MonthlyConsumptionSummary
    getMonthlyConsumptionSummary(
            Long householdId,
            Integer year,
            Integer month) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        getOwnedHousehold(
                householdId,
                currentUserId
        );

        if (year == null || year < 2000) {

            throw new IllegalArgumentException(
                    "Invalid year"
            );
        }

        if (month == null ||
                month < 1 ||
                month > 12) {

            throw new IllegalArgumentException(
                    "Month must be between 1 and 12"
            );
        }

        LocalDate startDate =
                LocalDate.of(
                        year,
                        month,
                        1
                );

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

    // =========================================================
    // APPLIANCE CONSUMPTION BREAKDOWN
    // =========================================================
    public List<ApplianceConsumptionSummary>
    getApplianceConsumptionBreakdown(
            Long householdId,
            LocalDate startDate,
            LocalDate endDate) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        getOwnedHousehold(
                householdId,
                currentUserId
        );

        validateDateRange(
                startDate,
                endDate
        );

        List<DailyUsage> usageRecords =
                dailyUsageRepository
                        .findByApplianceRoomHouseholdHouseholdIdAndUsageDateBetween(
                                householdId,
                                startDate,
                                endDate
                        );

        Map<Long, BigDecimal>
                consumptionByAppliance =
                usageRecords.stream()

                        .filter(usage ->
                                usage
                                        .getEstimatedConsumptionKwh()
                                        != null
                        )

                        .collect(
                                Collectors.groupingBy(

                                        usage ->
                                                usage
                                                        .getAppliance()
                                                        .getApplianceId(),

                                        Collectors.reducing(
                                                BigDecimal.ZERO,
                                                DailyUsage::
                                                        getEstimatedConsumptionKwh,
                                                BigDecimal::add
                                        )
                                )
                        );

        BigDecimal totalHouseholdConsumption =
                consumptionByAppliance
                        .values()
                        .stream()
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        List<ApplianceConsumptionSummary> result =
                new ArrayList<>();

        for (Map.Entry<Long, BigDecimal> entry :
                consumptionByAppliance.entrySet()) {

            Long applianceId =
                    entry.getKey();

            BigDecimal applianceConsumption =
                    entry.getValue();

            Appliance appliance =
                    getOwnedAppliance(
                            applianceId,
                            currentUserId
                    );

            BigDecimal percentageShare =
                    BigDecimal.ZERO;

            if (totalHouseholdConsumption
                    .compareTo(
                            BigDecimal.ZERO
                    ) > 0) {

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

        result.sort(
                Comparator.comparing(
                        ApplianceConsumptionSummary::
                                getTotalConsumptionKwh
                ).reversed()
        );

        return result;
    }

    // =========================================================
    // HIGHEST CONSUMING APPLIANCE
    // =========================================================
    public ApplianceConsumptionSummary
    getHighestConsumingAppliance(
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

    // =========================================================
    // CATEGORY CONSUMPTION BREAKDOWN
    // =========================================================
    public List<CategoryConsumptionSummary>
    getCategoryConsumptionBreakdown(
            Long householdId,
            LocalDate startDate,
            LocalDate endDate) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        getOwnedHousehold(
                householdId,
                currentUserId
        );

        validateDateRange(
                startDate,
                endDate
        );

        List<DailyUsage> usageRecords =
                dailyUsageRepository
                        .findByApplianceRoomHouseholdHouseholdIdAndUsageDateBetween(
                                householdId,
                                startDate,
                                endDate
                        );

        Map<Long, BigDecimal>
                consumptionByCategory =
                usageRecords.stream()

                        .filter(usage ->
                                usage
                                        .getEstimatedConsumptionKwh()
                                        != null
                        )

                        .collect(
                                Collectors.groupingBy(

                                        usage ->
                                                usage
                                                        .getAppliance()
                                                        .getCategory()
                                                        .getCategoryId(),

                                        Collectors.reducing(
                                                BigDecimal.ZERO,
                                                DailyUsage::
                                                        getEstimatedConsumptionKwh,
                                                BigDecimal::add
                                        )
                                )
                        );

        BigDecimal totalHouseholdConsumption =
                consumptionByCategory
                        .values()
                        .stream()
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        List<CategoryConsumptionSummary> result =
                new ArrayList<>();

        for (Map.Entry<Long, BigDecimal> entry :
                consumptionByCategory.entrySet()) {

            Long categoryId =
                    entry.getKey();

            BigDecimal categoryConsumption =
                    entry.getValue();

            String categoryName =
                    usageRecords.stream()

                            .map(
                                    DailyUsage::
                                            getAppliance
                            )

                            .filter(appliance ->
                                    appliance
                                            .getCategory()
                                            .getCategoryId()
                                            .equals(
                                                    categoryId
                                            )
                            )

                            .findFirst()

                            .map(appliance ->
                                    appliance
                                            .getCategory()
                                            .getCategoryName()
                            )

                            .orElse(
                                    "Unknown"
                            );

            BigDecimal percentageShare =
                    BigDecimal.ZERO;

            if (totalHouseholdConsumption
                    .compareTo(
                            BigDecimal.ZERO
                    ) > 0) {

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

        result.sort(
                Comparator.comparing(
                        CategoryConsumptionSummary::
                                getTotalConsumptionKwh
                ).reversed()
        );

        return result;
    }

    // =========================================================
    // COMPLETE HOUSEHOLD ANALYTICS
    // =========================================================
    public HouseholdAnalyticsSummary
    getHouseholdAnalyticsSummary(
            Long householdId,
            LocalDate startDate,
            LocalDate endDate) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        getOwnedHousehold(
                householdId,
                currentUserId
        );

        validateDateRange(
                startDate,
                endDate
        );

        BigDecimal totalConsumption =
                getHouseholdConsumption(
                        householdId,
                        startDate,
                        endDate
                );

        List<ApplianceConsumptionSummary>
                applianceBreakdown =
                getApplianceConsumptionBreakdown(
                        householdId,
                        startDate,
                        endDate
                );

        List<CategoryConsumptionSummary>
                categoryBreakdown =
                getCategoryConsumptionBreakdown(
                        householdId,
                        startDate,
                        endDate
                );

        ApplianceConsumptionSummary
                highestConsumingAppliance = null;

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

    // =========================================================
    // VERIFY HOUSEHOLD OWNERSHIP
    // =========================================================
    private Household getOwnedHousehold(
            Long householdId,
            Long currentUserId) {

        Household household =
                householdRepository
                        .findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        if (household.getUser() == null ||
                household
                        .getUser()
                        .getUserId() == null ||
                !household
                        .getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Household not found with id: "
                            + householdId
            );
        }

        return household;
    }

    // =========================================================
    // VERIFY APPLIANCE OWNERSHIP
    // =========================================================
    private Appliance getOwnedAppliance(
            Long applianceId,
            Long currentUserId) {

        Appliance appliance =
                applianceRepository
                        .findById(applianceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appliance not found with id: "
                                                + applianceId
                                )
                        );

        if (appliance.getRoom() == null ||
                appliance
                        .getRoom()
                        .getHousehold() == null ||
                appliance
                        .getRoom()
                        .getHousehold()
                        .getUser() == null ||
                appliance
                        .getRoom()
                        .getHousehold()
                        .getUser()
                        .getUserId() == null ||
                !appliance
                        .getRoom()
                        .getHousehold()
                        .getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Appliance not found with id: "
                            + applianceId
            );
        }

        return appliance;
    }

    // =========================================================
    // VERIFY DAILY USAGE OWNERSHIP
    // =========================================================
    private void validateDailyUsageOwnership(
            DailyUsage dailyUsage,
            Long currentUserId) {

        if (dailyUsage.getAppliance() == null ||
                dailyUsage
                        .getAppliance()
                        .getRoom() == null ||
                dailyUsage
                        .getAppliance()
                        .getRoom()
                        .getHousehold() == null ||
                dailyUsage
                        .getAppliance()
                        .getRoom()
                        .getHousehold()
                        .getUser() == null ||
                dailyUsage
                        .getAppliance()
                        .getRoom()
                        .getHousehold()
                        .getUser()
                        .getUserId() == null ||
                !dailyUsage
                        .getAppliance()
                        .getRoom()
                        .getHousehold()
                        .getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Daily usage not found with id: "
                            + dailyUsage.getUsageId()
            );
        }
    }

    // =========================================================
    // DATE RANGE VALIDATION
    // =========================================================
    private void validateDateRange(
            LocalDate startDate,
            LocalDate endDate) {

        if (startDate == null ||
                endDate == null) {

            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (endDate.isBefore(startDate)) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }
    }
}