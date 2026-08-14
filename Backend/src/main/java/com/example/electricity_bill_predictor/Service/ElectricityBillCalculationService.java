package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.DTO.BillCalculationResult;
import com.example.electricity_bill_predictor.Entity.TariffRate;
import com.example.electricity_bill_predictor.Repository.TariffRateRepository;
import com.example.electricity_bill_predictor.Repository.TariffRepository;
import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
public class ElectricityBillCalculationService {

    private final TariffRateRepository tariffRateRepository;
    private final TariffRepository tariffRepository;

    public ElectricityBillCalculationService(
            TariffRateRepository tariffRateRepository,
            TariffRepository tariffRepository) {

        this.tariffRateRepository = tariffRateRepository;
        this.tariffRepository = tariffRepository;
    }

    public BillCalculationResult calculateBill(
            Long tariffId,
            Integer unitsConsumed) {

        // Check units
        if (unitsConsumed == null || unitsConsumed < 0) {
            throw new IllegalArgumentException(
                    "Units consumed cannot be negative"
            );
        }

        // Check tariff exists
        tariffRepository.findById(tariffId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tariff not found with id: " + tariffId
                        )
                );

        // Get tariff rates
        List<TariffRate> allRates =
                tariffRateRepository
                        .findByTariffTariffIdOrderByBlockOrderAsc(
                                tariffId
                        );

        if (allRates.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No tariff rates found for tariff id: "
                            + tariffId
            );
        }

        // Decide which tariff structure applies
        String consumerGroup;

        if (unitsConsumed <= 60) {
            consumerGroup = "LOW_USAGE";
        } else if (unitsConsumed <= 180) {
            consumerGroup = "ABOVE_60_TO_180";
        } else {
            consumerGroup = "ABOVE_180";
        }

        // Get only rates belonging to the selected group
        List<TariffRate> applicableRates =
                allRates.stream()
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

        BigDecimal energyCharge = BigDecimal.ZERO;
        BigDecimal fixedCharge = BigDecimal.ZERO;

        for (TariffRate rate : applicableRates) {

            int lowerBoundary;

            if (rate.getMinUnits() == 0) {
                lowerBoundary = 0;
            } else {
                lowerBoundary = rate.getMinUnits() - 1;
            }

            int upperBoundary;

            if (rate.getMaxUnits() == null) {
                upperBoundary = unitsConsumed;
            } else {
                upperBoundary =
                        Math.min(
                                unitsConsumed,
                                rate.getMaxUnits()
                        );
            }

            if (unitsConsumed > lowerBoundary) {

                int unitsInBlock =
                        upperBoundary - lowerBoundary;

                if (unitsInBlock > 0) {

                    BigDecimal blockCharge =
                            rate.getRatePerUnit()
                                    .multiply(
                                            BigDecimal.valueOf(
                                                    unitsInBlock
                                            )
                                    );

                    energyCharge =
                            energyCharge.add(blockCharge);
                }
            }

            // Select fixed charge based on final consumption band
            boolean fallsInsideThisBlock =
                    unitsConsumed >= rate.getMinUnits()
                            &&
                            (
                                    rate.getMaxUnits() == null
                                            ||
                                            unitsConsumed
                                                    <= rate.getMaxUnits()
                            );

            if (fallsInsideThisBlock) {
                fixedCharge = rate.getFixedCharge();
            }
        }

        BigDecimal totalBill =
                energyCharge.add(fixedCharge);

        return new BillCalculationResult(
                unitsConsumed,
                consumerGroup,
                energyCharge,
                fixedCharge,
                totalBill
        );
    }
}