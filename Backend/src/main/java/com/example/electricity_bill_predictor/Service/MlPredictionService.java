package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.DTO.BillCalculationResult;
import com.example.electricity_bill_predictor.DTO.MlBillPredictionResult;
import com.example.electricity_bill_predictor.DTO.MlPredictionRequest;
import com.example.electricity_bill_predictor.DTO.MlPredictionResponse;
import com.example.electricity_bill_predictor.Entity.Appliance;
import com.example.electricity_bill_predictor.Entity.Household;
import com.example.electricity_bill_predictor.Repository.ApplianceRepository;
import com.example.electricity_bill_predictor.Repository.DailyUsageRepository;
import com.example.electricity_bill_predictor.Repository.HouseholdRepository;
import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class MlPredictionService {

    private final RestClient restClient;

    private final ElectricityBillCalculationService
            electricityBillCalculationService;

    private final HouseholdRepository householdRepository;

    private final ApplianceRepository applianceRepository;

    private final DailyUsageService dailyUsageService;

    private final DailyUsageRepository dailyUsageRepository;


    public MlPredictionService(
            ElectricityBillCalculationService electricityBillCalculationService,
            HouseholdRepository householdRepository,
            ApplianceRepository applianceRepository,
            DailyUsageService dailyUsageService,
            DailyUsageRepository dailyUsageRepository) {

        this.restClient = RestClient.builder()
                .baseUrl("http://127.0.0.1:8000")
                .build();

        this.electricityBillCalculationService =
                electricityBillCalculationService;

        this.householdRepository =
                householdRepository;

        this.applianceRepository =
                applianceRepository;

        this.dailyUsageService =
                dailyUsageService;

        this.dailyUsageRepository =
                dailyUsageRepository;
    }


    // Get predicted electricity consumption from FastAPI/XGBoost
    public MlPredictionResponse predictConsumption(
            MlPredictionRequest request) {

        MlPredictionResponse response =
                restClient.post()
                        .uri("/predict")
                        .body(request)
                        .retrieve()
                        .body(MlPredictionResponse.class);

        if (response == null) {
            throw new IllegalStateException(
                    "ML prediction service returned no response"
            );
        }

        return response;
    }


    // Predict consumption and calculate predicted electricity bill
    public MlBillPredictionResult predictBill(
            Long tariffId,
            MlPredictionRequest request) {

        // Step 1: Get predicted kWh from XGBoost
        MlPredictionResponse predictionResponse =
                predictConsumption(request);

        Double predictedKwh =
                predictionResponse
                        .getPredictedNextMonthKwh();

        if (predictedKwh == null) {
            throw new IllegalStateException(
                    "Predicted consumption was not returned"
            );
        }

        // Round predicted consumption for tariff calculation
        Integer billingUnits =
                (int) Math.round(predictedKwh);

        // Step 2: Calculate bill using Java tariff engine
        BillCalculationResult billResult =
                electricityBillCalculationService
                        .calculateBill(
                                tariffId,
                                billingUnits
                        );

        // Step 3: Return predicted consumption and bill
        return new MlBillPredictionResult(
                predictedKwh,
                billResult.getTotalBill()
        );
    }


    // Automatically build ML request from household database data
    public MlPredictionRequest buildPredictionRequest(
            Long householdId,
            Integer year,
            Integer month) {

        // Check household exists
        Household household =
                householdRepository
                        .findById(householdId)
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


        // Get all appliances belonging to household
        List<Appliance> appliances =
                applianceRepository
                        .findByRoomHouseholdHouseholdId(
                                householdId
                        );


        // Calculate total appliance quantity
        int applianceCount =
                appliances.stream()
                        .mapToInt(appliance ->
                                appliance.getQuantity() == null
                                        ? 0
                                        : appliance.getQuantity()
                        )
                        .sum();


        // Calculate total rated power
        BigDecimal totalRatedPower =
                appliances.stream()
                        .map(appliance -> {

                            BigDecimal ratedPower =
                                    appliance.getRatedPower() == null
                                            ? BigDecimal.ZERO
                                            : appliance.getRatedPower();

                            int quantity =
                                    appliance.getQuantity() == null
                                            ? 0
                                            : appliance.getQuantity();

                            return ratedPower.multiply(
                                    BigDecimal.valueOf(quantity)
                            );
                        })
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        // Determine prediction month
        YearMonth predictionMonth =
                YearMonth.of(
                        year,
                        month
                );


        // Previous 3 months
        YearMonth previousMonth =
                predictionMonth.minusMonths(1);

        YearMonth previous2Month =
                predictionMonth.minusMonths(2);

        YearMonth previous3Month =
                predictionMonth.minusMonths(3);


        // IMPORTANT:
        // Check that actual usage records exist for all 3 months.
        // Missing records must not be treated as 0 kWh.
        validateHistoricalMonth(
                householdId,
                previousMonth
        );

        validateHistoricalMonth(
                householdId,
                previous2Month
        );

        validateHistoricalMonth(
                householdId,
                previous3Month
        );


        // Get actual consumption from database
        BigDecimal previousMonthKwh =
                getMonthlyConsumption(
                        householdId,
                        previousMonth
                );

        BigDecimal previous2MonthKwh =
                getMonthlyConsumption(
                        householdId,
                        previous2Month
                );

        BigDecimal previous3MonthKwh =
                getMonthlyConsumption(
                        householdId,
                        previous3Month
                );


        // Calculate 3-month average
        BigDecimal averageLast3Months =
                previousMonthKwh
                        .add(previous2MonthKwh)
                        .add(previous3MonthKwh)
                        .divide(
                                BigDecimal.valueOf(3),
                                3,
                                RoundingMode.HALF_UP
                        );


        // Build request for XGBoost
        MlPredictionRequest request =
                new MlPredictionRequest();

        request.setYear(year);

        request.setMonth(month);

        request.setNumberOfResidents(
                household.getNumberOfResidents()
        );

        request.setApplianceCount(
                applianceCount
        );

        request.setTotalRatedPowerW(
                totalRatedPower.doubleValue()
        );

        request.setPreviousMonthKwh(
                previousMonthKwh.doubleValue()
        );

        request.setPrevious2MonthKwh(
                previous2MonthKwh.doubleValue()
        );

        request.setPrevious3MonthKwh(
                previous3MonthKwh.doubleValue()
        );

        request.setAverageLast3MonthsKwh(
                averageLast3Months.doubleValue()
        );

        return request;
    }


    // Check whether a household has usage records for a specific month
    private void validateHistoricalMonth(
            Long householdId,
            YearMonth yearMonth) {

        LocalDate startDate =
                yearMonth.atDay(1);

        LocalDate endDate =
                yearMonth.atEndOfMonth();

        boolean hasUsageData =
                dailyUsageRepository
                        .existsByApplianceRoomHouseholdHouseholdIdAndUsageDateBetween(
                                householdId,
                                startDate,
                                endDate
                        );

        if (!hasUsageData) {
            throw new IllegalArgumentException(
                    "Insufficient historical usage data. "
                            + "No usage records found for "
                            + yearMonth
            );
        }
    }


    // Get household consumption for one specific month
    private BigDecimal getMonthlyConsumption(
            Long householdId,
            YearMonth yearMonth) {

        LocalDate startDate =
                yearMonth.atDay(1);

        LocalDate endDate =
                yearMonth.atEndOfMonth();

        return dailyUsageService
                .getHouseholdConsumption(
                        householdId,
                        startDate,
                        endDate
                );
    }
}