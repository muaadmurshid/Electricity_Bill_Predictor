package com.example.electricity_bill_predictor.Controller;

import jakarta.validation.Valid;

import com.example.electricity_bill_predictor.Entity.Tariff;
import com.example.electricity_bill_predictor.Service.TariffService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tariffs")
@CrossOrigin(origins = "*")
public class TariffController {

    private final TariffService tariffService;

    public TariffController(TariffService tariffService) {
        this.tariffService = tariffService;
    }

    // GET /api/tariffs
    @GetMapping
    public List<Tariff> getAllTariffs() {
        return tariffService.getAllTariffs();
    }

    // GET /api/tariffs/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Tariff> getTariffById(
            @PathVariable Long id) {

        Tariff tariff = tariffService.getTariffById(id);

        return ResponseEntity.ok(tariff);
    }

    // POST /api/tariffs
    @PostMapping
    public ResponseEntity<Tariff> createTariff(
            @Valid @RequestBody Tariff tariff) {

        Tariff createdTariff = tariffService.createTariff(tariff);
        return ResponseEntity.ok(createdTariff);
    }

    // PUT /api/tariffs/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Tariff> updateTariff(
            @PathVariable Long id,
            @Valid @RequestBody Tariff tariff) {

        try {
            Tariff updatedTariff =
                    tariffService.updateTariff(id, tariff);

            return ResponseEntity.ok(updatedTariff);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/tariffs/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTariff(
            @PathVariable Long id) {

        try {
            tariffService.deleteTariff(id);

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}