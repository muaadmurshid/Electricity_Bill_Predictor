package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.TariffRate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TariffRateRepository
        extends JpaRepository<TariffRate, Long> {

    List<TariffRate> findByTariffTariffIdOrderByBlockOrderAsc(Long tariffId);
}