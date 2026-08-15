package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.DTO.MlBillPredictionResult;
import com.example.electricity_bill_predictor.DTO.MlPredictionRequest;
import com.example.electricity_bill_predictor.DTO.MlPredictionResponse;

import com.example.electricity_bill_predictor.Entity.BillPrediction;
import com.example.electricity_bill_predictor.Entity.Budget;
import com.example.electricity_bill_predictor.Entity.EnergyGoal;

import com.example.electricity_bill_predictor.Service.BillPredictionService;
import com.example.electricity_bill_predictor.Service.BudgetService;
import com.example.electricity_bill_predictor.Service.EnergyGoalService;
import com.example.electricity_bill_predictor.Service.MlPredictionService;
import com.example.electricity_bill_predictor.Service.NotificationService;

import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/ml")
public class MlPredictionController {

    private final MlPredictionService mlPredictionService;
    private final BillPredictionService billPredictionService;
    private final BudgetService budgetService;
    private final EnergyGoalService energyGoalService;
    private final NotificationService notificationService;

    public MlPredictionController(
            MlPredictionService mlPredictionService,
            BillPredictionService billPredictionService,
            BudgetService budgetService,
            EnergyGoalService energyGoalService,
            NotificationService notificationService) {

        this.mlPredictionService = mlPredictionService;
        this.billPredictionService = billPredictionService;
        this.budgetService = budgetService;
        this.energyGoalService = energyGoalService;
        this.notificationService = notificationService;
    }

    // Manual ML consumption prediction
    @PostMapping("/predict")
    public ResponseEntity<MlPredictionResponse> predictConsumption(
            @RequestBody MlPredictionRequest request) {

        MlPredictionResponse response =
                mlPredictionService.predictConsumption(request);

        return ResponseEntity.ok(response);
    }

    // Manual ML prediction + bill calculation
    @PostMapping("/predict-bill")
    public ResponseEntity<MlBillPredictionResult> predictBill(
            @RequestParam Long tariffId,
            @RequestBody MlPredictionRequest request) {

        MlBillPredictionResult result =
                mlPredictionService.predictBill(
                        tariffId,
                        request
                );

        return ResponseEntity.ok(result);
    }

    // Automatic household prediction
    // + save prediction
    // + update budget
    // + update energy goals
    // + create notifications
    @PostMapping("/predict-household")
    public ResponseEntity<BillPrediction> predictHouseholdBill(
            @RequestParam Long householdId,
            @RequestParam Long tariffId,
            @RequestParam Integer year,
            @RequestParam Integer month) {

        // Build ML request automatically
        MlPredictionRequest request =
                mlPredictionService.buildPredictionRequest(
                        householdId,
                        year,
                        month
                );

        // Predict consumption + bill
        MlBillPredictionResult result =
                mlPredictionService.predictBill(
                        tariffId,
                        request
                );

        // Save prediction
        BillPrediction savedPrediction =
                billPredictionService.saveMlPrediction(
                        householdId,
                        tariffId,
                        year,
                        month,
                        result
                );

        // ---------------------------------
        // UPDATE BUDGET + CREATE NOTIFICATION
        // ---------------------------------

        try {

            Budget updatedBudget =
                    budgetService.updateBudgetStatus(
                            householdId,
                            year,
                            month,
                            result.getPredictedBillAmount()
                    );

            if ("WARNING".equals(
                    updatedBudget.getStatus())) {

                notificationService.createAutomaticNotification(
                        householdId,
                        "Budget Warning",
                        "Your predicted electricity bill is approaching "
                                + "your monthly budget limit.",
                        "BUDGET_WARNING"
                );
            }

            if ("OVER_BUDGET".equals(
                    updatedBudget.getStatus())) {

                notificationService.createAutomaticNotification(
                        householdId,
                        "Budget Exceeded",
                        "Your predicted electricity bill is higher than "
                                + "your monthly budget.",
                        "BUDGET_EXCEEDED"
                );
            }

        } catch (ResourceNotFoundException e) {

            // No budget exists.
            // Prediction must still succeed.
        }

        // ---------------------------------
        // UPDATE ENERGY GOALS
        // ---------------------------------

        LocalDate targetDate =
                LocalDate.of(
                        year,
                        month,
                        1
                );

        List<EnergyGoal> activeGoals =
                energyGoalService.getActiveGoals(
                        householdId,
                        targetDate
                );

        BigDecimal predictedConsumption =
                BigDecimal.valueOf(
                        result.getPredictedConsumptionKwh()
                );

        for (EnergyGoal goal : activeGoals) {

            EnergyGoal updatedGoal =
                    energyGoalService.updateGoalProgress(
                            goal.getGoalId(),
                            predictedConsumption
                    );

            // ---------------------------------
            // ENERGY GOAL NOTIFICATIONS
            // ---------------------------------

            if ("AT_RISK".equals(
                    updatedGoal.getStatus())) {

                notificationService.createAutomaticNotification(
                        householdId,
                        "Energy Goal At Risk",
                        "Your predicted electricity consumption is higher "
                                + "than the target for your energy goal: "
                                + updatedGoal.getGoalName(),
                        "GOAL_AT_RISK"
                );
            }

            if ("MISSED".equals(
                    updatedGoal.getStatus())) {

                notificationService.createAutomaticNotification(
                        householdId,
                        "Energy Goal Missed",
                        "Your electricity consumption exceeded the target "
                                + "for your energy goal: "
                                + updatedGoal.getGoalName(),
                        "GOAL_MISSED"
                );
            }
        }

        return ResponseEntity.ok(
                savedPrediction
        );
    }
}