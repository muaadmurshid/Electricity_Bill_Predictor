package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.Entity.TariffRate;
import com.example.electricity_bill_predictor.Service.TariffRateService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tariff-rates")
public class TariffRateController {

    private final TariffRateService tariffRateService;

    public TariffRateController(
            TariffRateService tariffRateService) {

        this.tariffRateService = tariffRateService;
    }

    // GET all tariff rates
    @GetMapping
    public List<TariffRate> getAllTariffRates() {

        return tariffRateService.getAllTariffRates();
    }

    // GET tariff rate by ID
    @GetMapping("/{id}")
    public ResponseEntity<TariffRate> getTariffRateById(
            @PathVariable Long id) {

        TariffRate tariffRate =
                tariffRateService.getTariffRateById(id);

        return ResponseEntity.ok(tariffRate);
    }

    // GET tariff rates belonging to one tariff
    @GetMapping("/tariff/{tariffId}")
    public List<TariffRate> getTariffRatesByTariffId(
            @PathVariable Long tariffId) {

        return tariffRateService
                .getTariffRatesByTariffId(tariffId);
    }

    // CREATE tariff rate
    @PostMapping
    public ResponseEntity<TariffRate> createTariffRate(
            @Valid @RequestBody TariffRate tariffRate) {

        TariffRate createdTariffRate =
                tariffRateService.createTariffRate(tariffRate);

        return ResponseEntity.ok(createdTariffRate);
    }

    // UPDATE tariff rate
    @PutMapping("/{id}")
    public ResponseEntity<TariffRate> updateTariffRate(
            @PathVariable Long id,
            @Valid @RequestBody TariffRate tariffRate) {

        TariffRate updatedTariffRate =
                tariffRateService.updateTariffRate(
                        id,
                        tariffRate
                );

        return ResponseEntity.ok(updatedTariffRate);
    }

    // DELETE tariff rate
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTariffRate(
            @PathVariable Long id) {

        tariffRateService.deleteTariffRate(id);

        return ResponseEntity.noContent().build();
    }
}