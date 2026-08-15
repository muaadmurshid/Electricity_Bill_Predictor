package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.DTO.MlBillPredictionResult;

import com.example.electricity_bill_predictor.Entity.BillPrediction;
import com.example.electricity_bill_predictor.Entity.Household;
import com.example.electricity_bill_predictor.Entity.Tariff;

import com.example.electricity_bill_predictor.Repository.BillPredictionRepository;
import com.example.electricity_bill_predictor.Repository.HouseholdRepository;
import com.example.electricity_bill_predictor.Repository.TariffRepository;

import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class BillPredictionService {

    private final BillPredictionRepository billPredictionRepository;
    private final HouseholdRepository householdRepository;
    private final TariffRepository tariffRepository;
    private final CurrentUserService currentUserService;

    public BillPredictionService(
            BillPredictionRepository billPredictionRepository,
            HouseholdRepository householdRepository,
            TariffRepository tariffRepository,
            CurrentUserService currentUserService) {

        this.billPredictionRepository =
                billPredictionRepository;

        this.householdRepository =
                householdRepository;

        this.tariffRepository =
                tariffRepository;

        this.currentUserService =
                currentUserService;
    }

    // =========================================================
    // GET ALL PREDICTIONS FOR CURRENT USER
    // =========================================================
    public List<BillPrediction> getAllBillPredictions() {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        return billPredictionRepository
                .findByHouseholdUserUserIdOrderByPredictionDateDesc(
                        currentUserId
                );
    }

    // =========================================================
    // GET PREDICTION BY ID
    // =========================================================
    public BillPrediction getBillPredictionById(
            Long predictionId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        BillPrediction prediction =
                billPredictionRepository
                        .findById(predictionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bill prediction not found with id: "
                                                + predictionId
                                )
                        );

        validatePredictionOwnership(
                prediction,
                currentUserId
        );

        return prediction;
    }

    // =========================================================
    // CREATE PREDICTION MANUALLY
    // =========================================================
    public BillPrediction createBillPrediction(
            BillPrediction billPrediction) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        if (billPrediction.getHousehold() == null ||
                billPrediction
                        .getHousehold()
                        .getHouseholdId() == null) {

            throw new IllegalArgumentException(
                    "Household is required"
            );
        }

        if (billPrediction.getTariff() == null ||
                billPrediction
                        .getTariff()
                        .getTariffId() == null) {

            throw new IllegalArgumentException(
                    "Tariff is required"
            );
        }

        Long householdId =
                billPrediction
                        .getHousehold()
                        .getHouseholdId();

        Household household =
                getOwnedHousehold(
                        householdId,
                        currentUserId
                );

        Long tariffId =
                billPrediction
                        .getTariff()
                        .getTariffId();

        Tariff tariff =
                getTariff(
                        tariffId
                );

        billPrediction.setHousehold(
                household
        );

        billPrediction.setTariff(
                tariff
        );

        return billPredictionRepository.save(
                billPrediction
        );
    }

    // =========================================================
    // SAVE AUTOMATIC XGBOOST PREDICTION
    // Household must belong to current user
    // =========================================================
    public BillPrediction saveMlPrediction(
            Long householdId,
            Long tariffId,
            Integer year,
            Integer month,
            MlBillPredictionResult mlResult) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Household household =
                getOwnedHousehold(
                        householdId,
                        currentUserId
                );

        Tariff tariff =
                getTariff(
                        tariffId
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

        if (mlResult == null ||
                mlResult.getPredictedConsumptionKwh() == null ||
                mlResult.getPredictedBillAmount() == null) {

            throw new IllegalArgumentException(
                    "ML prediction result is incomplete"
            );
        }

        BillPrediction prediction =
                new BillPrediction();

        prediction.setHousehold(
                household
        );

        prediction.setTariff(
                tariff
        );

        prediction.setPredictionDate(
                LocalDate.now()
        );

        prediction.setTargetMonth(
                LocalDate.of(
                        year,
                        month,
                        1
                )
        );

        prediction.setPredictedConsumptionKwh(
                BigDecimal.valueOf(
                        mlResult
                                .getPredictedConsumptionKwh()
                )
        );

        prediction.setPredictedBillAmount(
                mlResult.getPredictedBillAmount()
        );

        prediction.setLowerEstimate(
                null
        );

        prediction.setUpperEstimate(
                null
        );

        prediction.setPredictionStatus(
                "PREDICTED"
        );

        return billPredictionRepository.save(
                prediction
        );
    }

    // =========================================================
    // UPDATE PREDICTION
    // =========================================================
    public BillPrediction updateBillPrediction(
            Long predictionId,
            BillPrediction predictionDetails) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        BillPrediction existingPrediction =
                billPredictionRepository
                        .findById(predictionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bill prediction not found with id: "
                                                + predictionId
                                )
                        );

        validatePredictionOwnership(
                existingPrediction,
                currentUserId
        );

        /*
         * Household can only be changed to
         * another household owned by the same user.
         */
        if (predictionDetails.getHousehold() != null &&
                predictionDetails
                        .getHousehold()
                        .getHouseholdId() != null) {

            Long householdId =
                    predictionDetails
                            .getHousehold()
                            .getHouseholdId();

            Household household =
                    getOwnedHousehold(
                            householdId,
                            currentUserId
                    );

            existingPrediction.setHousehold(
                    household
            );
        }

        /*
         * Tariff is shared/system-level data.
         */
        if (predictionDetails.getTariff() != null &&
                predictionDetails
                        .getTariff()
                        .getTariffId() != null) {

            Long tariffId =
                    predictionDetails
                            .getTariff()
                            .getTariffId();

            Tariff tariff =
                    getTariff(
                            tariffId
                    );

            existingPrediction.setTariff(
                    tariff
            );
        }

        existingPrediction.setPredictionDate(
                predictionDetails.getPredictionDate()
        );

        existingPrediction.setTargetMonth(
                predictionDetails.getTargetMonth()
        );

        existingPrediction.setPredictedConsumptionKwh(
                predictionDetails
                        .getPredictedConsumptionKwh()
        );

        existingPrediction.setPredictedBillAmount(
                predictionDetails
                        .getPredictedBillAmount()
        );

        existingPrediction.setLowerEstimate(
                predictionDetails.getLowerEstimate()
        );

        existingPrediction.setUpperEstimate(
                predictionDetails.getUpperEstimate()
        );

        existingPrediction.setPredictionStatus(
                predictionDetails
                        .getPredictionStatus()
        );

        return billPredictionRepository.save(
                existingPrediction
        );
    }

    // =========================================================
    // PREDICTION HISTORY FOR HOUSEHOLD
    // =========================================================
    public List<BillPrediction>
    getPredictionHistoryByHousehold(
            Long householdId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        getOwnedHousehold(
                householdId,
                currentUserId
        );

        return billPredictionRepository
                .findByHouseholdHouseholdIdOrderByPredictionDateDesc(
                        householdId
                );
    }

    // =========================================================
    // LATEST PREDICTION FOR HOUSEHOLD
    // =========================================================
    public BillPrediction
    getLatestPredictionByHousehold(
            Long householdId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        getOwnedHousehold(
                householdId,
                currentUserId
        );

        return billPredictionRepository
                .findFirstByHouseholdHouseholdIdOrderByPredictionDateDescPredictionIdDesc(
                        householdId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No bill predictions found for household id: "
                                        + householdId
                        )
                );
    }

    // =========================================================
    // DELETE PREDICTION
    // =========================================================
    public void deleteBillPrediction(
            Long predictionId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        BillPrediction existingPrediction =
                billPredictionRepository
                        .findById(predictionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bill prediction not found with id: "
                                                + predictionId
                                )
                        );

        validatePredictionOwnership(
                existingPrediction,
                currentUserId
        );

        billPredictionRepository.delete(
                existingPrediction
        );
    }

    // =========================================================
    // HOUSEHOLD OWNERSHIP
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
    // PREDICTION OWNERSHIP
    // =========================================================
    private void validatePredictionOwnership(
            BillPrediction prediction,
            Long currentUserId) {

        if (prediction.getHousehold() == null ||
                prediction
                        .getHousehold()
                        .getUser() == null ||
                prediction
                        .getHousehold()
                        .getUser()
                        .getUserId() == null ||
                !prediction
                        .getHousehold()
                        .getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Bill prediction not found with id: "
                            + prediction.getPredictionId()
            );
        }
    }

    // =========================================================
    // TARIFF LOOKUP
    // =========================================================
    private Tariff getTariff(
            Long tariffId) {

        return tariffRepository
                .findById(tariffId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tariff not found with id: "
                                        + tariffId
                        )
                );
    }
}