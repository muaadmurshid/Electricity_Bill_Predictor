package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.DTO.AdminDashboardSummary;

import com.example.electricity_bill_predictor.Repository.ApplianceRepository;
import com.example.electricity_bill_predictor.Repository.BillPredictionRepository;
import com.example.electricity_bill_predictor.Repository.ElectricityBillRepository;
import com.example.electricity_bill_predictor.Repository.HouseholdRepository;
import com.example.electricity_bill_predictor.Repository.UserRepository;

import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final HouseholdRepository householdRepository;
    private final ApplianceRepository applianceRepository;
    private final ElectricityBillRepository electricityBillRepository;
    private final BillPredictionRepository billPredictionRepository;

    public AdminService(
            UserRepository userRepository,
            HouseholdRepository householdRepository,
            ApplianceRepository applianceRepository,
            ElectricityBillRepository electricityBillRepository,
            BillPredictionRepository billPredictionRepository) {

        this.userRepository =
                userRepository;

        this.householdRepository =
                householdRepository;

        this.applianceRepository =
                applianceRepository;

        this.electricityBillRepository =
                electricityBillRepository;

        this.billPredictionRepository =
                billPredictionRepository;
    }

    public AdminDashboardSummary getDashboardSummary() {

        long totalUsers =
                userRepository.count();

        long totalHouseholds =
                householdRepository.count();

        long totalAppliances =
                applianceRepository.count();

        long totalElectricityBills =
                electricityBillRepository.count();

        long totalBillPredictions =
                billPredictionRepository.count();

        return new AdminDashboardSummary(
                totalUsers,
                totalHouseholds,
                totalAppliances,
                totalElectricityBills,
                totalBillPredictions
        );
    }
}