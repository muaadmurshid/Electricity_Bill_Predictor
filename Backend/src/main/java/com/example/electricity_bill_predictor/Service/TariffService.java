package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;
import com.example.electricity_bill_predictor.Entity.Tariff;
import com.example.electricity_bill_predictor.Repository.TariffRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TariffService {

    private final TariffRepository tariffRepository;

    public TariffService(TariffRepository tariffRepository) {
        this.tariffRepository = tariffRepository;
    }

    // Get all tariffs
    public List<Tariff> getAllTariffs() {
        return tariffRepository.findAll();
    }

    // Get tariff by ID
    public Tariff getTariffById(Long id) {
        return tariffRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tariff not found with id: " + id
                        )
                );
    }
    // Create tariff
    public Tariff createTariff(Tariff tariff) {

        if ("ACTIVE".equalsIgnoreCase(tariff.getStatus())) {

            tariffRepository.findByStatus("ACTIVE")
                    .ifPresent(existingTariff -> {
                        throw new IllegalArgumentException(
                                "An active tariff already exists"
                        );
                    });
        }

        return tariffRepository.save(tariff);
    }
    // Update tariff
    public Tariff updateTariff(
            Long tariffId,
            Tariff tariffDetails) {

        Tariff existingTariff =
                tariffRepository.findById(tariffId)
                        .orElseThrow(() ->
                                new RuntimeException("Tariff not found"));

        existingTariff.setTariffName(
                tariffDetails.getTariffName()
        );

        existingTariff.setEffectiveFrom(
                tariffDetails.getEffectiveFrom()
        );

        existingTariff.setEffectiveTo(
                tariffDetails.getEffectiveTo()
        );

        existingTariff.setRatePerUnit(
                tariffDetails.getRatePerUnit()
        );

        existingTariff.setFixedCharge(
                tariffDetails.getFixedCharge()
        );

        existingTariff.setStatus(
                tariffDetails.getStatus()
        );

        return tariffRepository.save(existingTariff);
    }

    // Delete tariff
    public void deleteTariff(Long tariffId) {

        if (!tariffRepository.existsById(tariffId)) {
            throw new RuntimeException("Tariff not found");
        }

        tariffRepository.deleteById(tariffId);
    }
}