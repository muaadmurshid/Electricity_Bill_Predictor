package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.DTO.BillCalculationResult;
import com.example.electricity_bill_predictor.DTO.TariffIntelligenceResponse;
import com.example.electricity_bill_predictor.DTO.TariffScenario;
import com.example.electricity_bill_predictor.DTO.TariffWhatIfResponse;
import com.example.electricity_bill_predictor.Entity.TariffRate;
import com.example.electricity_bill_predictor.Repository.TariffRateRepository;
import com.example.electricity_bill_predictor.Repository.TariffRepository;
import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class TariffIntelligenceService {

    private final ElectricityBillCalculationService
            electricityBillCalculationService;

    private final TariffRateRepository
            tariffRateRepository;

    private final TariffRepository
            tariffRepository;

    public TariffIntelligenceService(
            ElectricityBillCalculationService
                    electricityBillCalculationService,
            TariffRateRepository tariffRateRepository,
            TariffRepository tariffRepository) {

        this.electricityBillCalculationService =
                electricityBillCalculationService;

        this.tariffRateRepository =
                tariffRateRepository;

        this.tariffRepository =
                tariffRepository;
    }

    public TariffIntelligenceResponse getTariffIntelligence(
            Long tariffId,
            Integer currentUnits) {

        if (tariffId == null) {
            throw new IllegalArgumentException(
                    "Tariff ID is required"
            );
        }

        if (currentUnits == null || currentUnits < 0) {
            throw new IllegalArgumentException(
                    "Current units cannot be negative"
            );
        }

        tariffRepository.findById(tariffId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tariff not found with id: "
                                        + tariffId
                        )
                );

        BillCalculationResult currentBill =
                electricityBillCalculationService
                        .calculateBill(
                                tariffId,
                                currentUnits
                        );

        String consumerGroup =
                determineConsumerGroup(
                        currentUnits
                );

        List<TariffRate> applicableRates =
                tariffRateRepository
                        .findByTariffTariffIdOrderByBlockOrderAsc(
                                tariffId
                        )
                        .stream()
                        .filter(rate ->
                                consumerGroup.equals(
                                        rate.getConsumerGroup()
                                )
                        )
                        .sorted(
                                Comparator.comparing(
                                        TariffRate::getBlockOrder
                                )
                        )
                        .toList();

        if (applicableRates.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No tariff rates found for consumer group: "
                            + consumerGroup
            );
        }

        TariffRate currentBlock =
                findCurrentBlock(
                        applicableRates,
                        currentUnits
                );

        List<TariffScenario> scenarios =
                buildScenarios(
                        tariffId
                );

        TariffIntelligenceResponse response =
                new TariffIntelligenceResponse();

        response.setTariffId(
                tariffId
        );

        response.setCurrentUnits(
                currentUnits
        );

        response.setConsumerGroup(
                consumerGroup
        );

        response.setCurrentBlockMinUnits(
                currentBlock.getMinUnits()
        );

        response.setCurrentBlockMaxUnits(
                currentBlock.getMaxUnits()
        );

        response.setCurrentRatePerUnit(
                currentBlock.getRatePerUnit()
        );

        response.setCurrentFixedCharge(
                currentBlock.getFixedCharge()
        );

        response.setCurrentEstimatedBill(
                currentBill.getTotalBill()
        );

        if (currentBlock.getMaxUnits() != null) {

            response.setNextThresholdUnits(
                    currentBlock.getMaxUnits() + 1
            );

            response.setUnitsRemainingToNextThreshold(
                    Math.max(
                            currentBlock.getMaxUnits()
                                    - currentUnits,
                            0
                    )
            );

        } else {

            response.setNextThresholdUnits(
                    null
            );

            response.setUnitsRemainingToNextThreshold(
                    null
            );
        }

        response.setScenarios(
                scenarios
        );

        return response;
    }

    public TariffWhatIfResponse calculateWhatIf(
            Long tariffId,
            Integer currentUnits,
            Integer targetUnits) {

        if (tariffId == null) {
            throw new IllegalArgumentException(
                    "Tariff ID is required"
            );
        }

        if (currentUnits == null || currentUnits < 0) {
            throw new IllegalArgumentException(
                    "Current units cannot be negative"
            );
        }

        if (targetUnits == null || targetUnits < 0) {
            throw new IllegalArgumentException(
                    "Target units cannot be negative"
            );
        }

        BillCalculationResult currentResult =
                electricityBillCalculationService
                        .calculateBill(
                                tariffId,
                                currentUnits
                        );

        BillCalculationResult targetResult =
                electricityBillCalculationService
                        .calculateBill(
                                tariffId,
                                targetUnits
                        );

        BigDecimal currentBill =
                currentResult.getTotalBill();

        BigDecimal targetBill =
                targetResult.getTotalBill();

        Integer unitDifference =
                currentUnits - targetUnits;

        BigDecimal billDifference =
                currentBill.subtract(
                        targetBill
                );

        BigDecimal percentageDifference =
                BigDecimal.ZERO;

        if (currentBill.compareTo(
                BigDecimal.ZERO
        ) > 0) {

            percentageDifference =
                    billDifference
                            .divide(
                                    currentBill,
                                    4,
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

        TariffWhatIfResponse response =
                new TariffWhatIfResponse();

        response.setCurrentUnits(
                currentUnits
        );

        response.setTargetUnits(
                targetUnits
        );

        response.setCurrentBill(
                currentBill
        );

        response.setTargetBill(
                targetBill
        );

        response.setUnitDifference(
                unitDifference
        );

        response.setBillDifference(
                billDifference
        );

        response.setPercentageDifference(
                percentageDifference
        );

        return response;
    }

    private String determineConsumerGroup(
            Integer units) {

        if (units <= 60) {
            return "LOW_USAGE";
        }

        if (units <= 180) {
            return "ABOVE_60_TO_180";
        }

        return "ABOVE_180";
    }

    private TariffRate findCurrentBlock(
            List<TariffRate> rates,
            Integer units) {

        return rates.stream()
                .filter(rate ->
                        units >= rate.getMinUnits()
                                &&
                                (
                                        rate.getMaxUnits() == null
                                                ||
                                                units <=
                                                        rate.getMaxUnits()
                                )
                )
                .findFirst()
                .orElseGet(() ->
                        rates.get(
                                rates.size() - 1
                        )
                );
    }

    private List<TariffScenario> buildScenarios(
            Long tariffId) {

        List<Integer> usageLevels =
                List.of(
                        100,
                        200,
                        300,
                        400,
                        500,
                        750,
                        1000
                );

        List<TariffScenario> scenarios =
                new ArrayList<>();

        for (Integer units : usageLevels) {

            BillCalculationResult bill =
                    electricityBillCalculationService
                            .calculateBill(
                                    tariffId,
                                    units
                            );

            scenarios.add(
                    new TariffScenario(
                            units,
                            bill.getTotalBill()
                    )
            );
        }

        return scenarios;
    }
}