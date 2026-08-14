package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.Entity.Tariff;
import com.example.electricity_bill_predictor.Entity.TariffRate;
import com.example.electricity_bill_predictor.Repository.TariffRateRepository;
import com.example.electricity_bill_predictor.Repository.TariffRepository;
import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TariffRateService {

    private final TariffRateRepository tariffRateRepository;
    private final TariffRepository tariffRepository;

    public TariffRateService(
            TariffRateRepository tariffRateRepository,
            TariffRepository tariffRepository) {

        this.tariffRateRepository = tariffRateRepository;
        this.tariffRepository = tariffRepository;
    }

    // Get all tariff rates
    public List<TariffRate> getAllTariffRates() {
        return tariffRateRepository.findAll();
    }

    // Get tariff rate by ID
    public TariffRate getTariffRateById(Long id) {

        return tariffRateRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tariff rate not found with id: " + id
                        )
                );
    }

    // Get all tariff blocks for one tariff
    public List<TariffRate> getTariffRatesByTariffId(Long tariffId) {

        // First confirm that the tariff exists
        tariffRepository.findById(tariffId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tariff not found with id: " + tariffId
                        )
                );

        return tariffRateRepository
                .findByTariffTariffIdOrderByBlockOrderAsc(tariffId);
    }

    // Create tariff rate
    public TariffRate createTariffRate(TariffRate tariffRate) {

        Long tariffId =
                tariffRate.getTariff().getTariffId();

        Tariff tariff =
                tariffRepository.findById(tariffId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Tariff not found with id: "
                                                + tariffId
                                )
                        );

        tariffRate.setTariff(tariff);

        return tariffRateRepository.save(tariffRate);
    }

    // Update tariff rate
    public TariffRate updateTariffRate(
            Long tariffRateId,
            TariffRate tariffRateDetails) {

        TariffRate existingTariffRate =
                tariffRateRepository.findById(tariffRateId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Tariff rate not found with id: "
                                                + tariffRateId
                                )
                        );

        Long tariffId =
                tariffRateDetails.getTariff().getTariffId();

        Tariff tariff =
                tariffRepository.findById(tariffId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Tariff not found with id: "
                                                + tariffId
                                )
                        );

        existingTariffRate.setTariff(tariff);
        existingTariffRate.setMinUnits(
                tariffRateDetails.getMinUnits()
        );
        existingTariffRate.setMaxUnits(
                tariffRateDetails.getMaxUnits()
        );
        existingTariffRate.setRatePerUnit(
                tariffRateDetails.getRatePerUnit()
        );
        existingTariffRate.setFixedCharge(
                tariffRateDetails.getFixedCharge()
        );
        existingTariffRate.setConsumerGroup(
                tariffRateDetails.getConsumerGroup()
        );
        existingTariffRate.setBlockOrder(
                tariffRateDetails.getBlockOrder()
        );

        return tariffRateRepository.save(existingTariffRate);
    }

    // Delete tariff rate
    public void deleteTariffRate(Long tariffRateId) {

        TariffRate existingTariffRate =
                tariffRateRepository.findById(tariffRateId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Tariff rate not found with id: "
                                                + tariffRateId
                                )
                        );

        tariffRateRepository.delete(existingTariffRate);
    }
}