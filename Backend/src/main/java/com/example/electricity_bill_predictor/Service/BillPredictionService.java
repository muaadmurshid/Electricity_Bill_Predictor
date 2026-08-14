package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.Entity.BillPrediction;
import com.example.electricity_bill_predictor.Entity.Household;
import com.example.electricity_bill_predictor.Entity.Tariff;
import com.example.electricity_bill_predictor.Repository.BillPredictionRepository;
import com.example.electricity_bill_predictor.Repository.HouseholdRepository;
import com.example.electricity_bill_predictor.Repository.TariffRepository;
import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BillPredictionService {

    private final BillPredictionRepository billPredictionRepository;
    private final HouseholdRepository householdRepository;
    private final TariffRepository tariffRepository;

    public BillPredictionService(
            BillPredictionRepository billPredictionRepository,
            HouseholdRepository householdRepository,
            TariffRepository tariffRepository) {

        this.billPredictionRepository = billPredictionRepository;
        this.householdRepository = householdRepository;
        this.tariffRepository = tariffRepository;
    }

    public List<BillPrediction> getAllBillPredictions() {
        return billPredictionRepository.findAll();
    }

    public BillPrediction getBillPredictionById(Long id) {
        return billPredictionRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Bill prediction not found with id: " + id
                        )
                );
    }

    public BillPrediction createBillPrediction(
            BillPrediction billPrediction) {

        Long householdId =
                billPrediction.getHousehold().getHouseholdId();

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        Long tariffId =
                billPrediction.getTariff().getTariffId();

        Tariff tariff =
                tariffRepository.findById(tariffId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Tariff not found with id: "
                                                + tariffId
                                )
                        );

        billPrediction.setHousehold(household);
        billPrediction.setTariff(tariff);

        return billPredictionRepository.save(billPrediction);
    }

    public BillPrediction updateBillPrediction(
            Long predictionId,
            BillPrediction predictionDetails) {

        BillPrediction existingPrediction =
                billPredictionRepository.findById(predictionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bill prediction not found with id: "
                                                + predictionId
                                )
                        );

        Long householdId =
                predictionDetails.getHousehold().getHouseholdId();

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        Long tariffId =
                predictionDetails.getTariff().getTariffId();

        Tariff tariff =
                tariffRepository.findById(tariffId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Tariff not found with id: "
                                                + tariffId
                                )
                        );

        existingPrediction.setHousehold(household);
        existingPrediction.setTariff(tariff);
        existingPrediction.setPredictionDate(
                predictionDetails.getPredictionDate()
        );
        existingPrediction.setTargetMonth(
                predictionDetails.getTargetMonth()
        );
        existingPrediction.setPredictedConsumptionKwh(
                predictionDetails.getPredictedConsumptionKwh()
        );
        existingPrediction.setPredictedBillAmount(
                predictionDetails.getPredictedBillAmount()
        );
        existingPrediction.setLowerEstimate(
                predictionDetails.getLowerEstimate()
        );
        existingPrediction.setUpperEstimate(
                predictionDetails.getUpperEstimate()
        );
        existingPrediction.setPredictionStatus(
                predictionDetails.getPredictionStatus()
        );

        return billPredictionRepository.save(existingPrediction);
    }

    public void deleteBillPrediction(Long predictionId) {

        BillPrediction existingPrediction =
                billPredictionRepository.findById(predictionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Bill prediction not found with id: "
                                                + predictionId
                                )
                        );

        billPredictionRepository.delete(existingPrediction);
    }
}