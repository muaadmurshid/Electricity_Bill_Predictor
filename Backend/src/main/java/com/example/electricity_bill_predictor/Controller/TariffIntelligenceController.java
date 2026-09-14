package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.DTO.TariffIntelligenceResponse;
import com.example.electricity_bill_predictor.DTO.TariffWhatIfResponse;
import com.example.electricity_bill_predictor.Service.TariffIntelligenceService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tariff-intelligence")
public class TariffIntelligenceController {

    private final TariffIntelligenceService
            tariffIntelligenceService;

    public TariffIntelligenceController(
            TariffIntelligenceService
                    tariffIntelligenceService) {

        this.tariffIntelligenceService =
                tariffIntelligenceService;
    }

    @GetMapping
    public ResponseEntity<TariffIntelligenceResponse>
    getTariffIntelligence(
            @RequestParam Long tariffId,
            @RequestParam Integer units) {

        TariffIntelligenceResponse response =
                tariffIntelligenceService
                        .getTariffIntelligence(
                                tariffId,
                                units
                        );

        return ResponseEntity.ok(
                response
        );
    }

    @GetMapping("/what-if")
    public ResponseEntity<TariffWhatIfResponse>
    calculateWhatIf(
            @RequestParam Long tariffId,
            @RequestParam Integer currentUnits,
            @RequestParam Integer targetUnits) {

        TariffWhatIfResponse response =
                tariffIntelligenceService
                        .calculateWhatIf(
                                tariffId,
                                currentUnits,
                                targetUnits
                        );

        return ResponseEntity.ok(
                response
        );
    }
}