package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.Tariff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TariffRepository extends JpaRepository<Tariff, Long> {

    Optional<Tariff> findByStatus(String status);
}