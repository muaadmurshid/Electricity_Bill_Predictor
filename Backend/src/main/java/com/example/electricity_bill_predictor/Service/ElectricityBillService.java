package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.Entity.ElectricityBill;
import com.example.electricity_bill_predictor.Entity.Household;
import com.example.electricity_bill_predictor.Repository.ElectricityBillRepository;
import com.example.electricity_bill_predictor.Repository.HouseholdRepository;
import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ElectricityBillService {

    private final ElectricityBillRepository electricityBillRepository;
    private final HouseholdRepository householdRepository;

    public ElectricityBillService(
            ElectricityBillRepository electricityBillRepository,
            HouseholdRepository householdRepository) {

        this.electricityBillRepository = electricityBillRepository;
        this.householdRepository = householdRepository;
    }

    // Get all electricity bills
    public List<ElectricityBill> getAllElectricityBills() {
        return electricityBillRepository.findAll();
    }

    // Get electricity bill by ID
    public ElectricityBill getElectricityBillById(Long id) {
        return electricityBillRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Electricity bill not found with id: " + id
                        )
                );
    }

    // Create electricity bill
    public ElectricityBill createElectricityBill(
            ElectricityBill electricityBill) {

        Long householdId =
                electricityBill.getHousehold().getHouseholdId();

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        electricityBill.setHousehold(household);

        return electricityBillRepository.save(electricityBill);
    }

    // Update electricity bill
    public ElectricityBill updateElectricityBill(
            Long billId,
            ElectricityBill electricityBillDetails) {

        ElectricityBill existingBill =
                electricityBillRepository.findById(billId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Electricity bill not found with id: "
                                                + billId
                                )
                        );

        Long householdId =
                electricityBillDetails.getHousehold().getHouseholdId();

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        existingBill.setHousehold(household);

        existingBill.setBillingPeriod(
                electricityBillDetails.getBillingPeriod()
        );

        existingBill.setUnitsConsumedKwh(
                electricityBillDetails.getUnitsConsumedKwh()
        );

        existingBill.setBillAmount(
                electricityBillDetails.getBillAmount()
        );

        existingBill.setBillDate(
                electricityBillDetails.getBillDate()
        );

        existingBill.setPaymentStatus(
                electricityBillDetails.getPaymentStatus()
        );

        return electricityBillRepository.save(existingBill);
    }

    // Delete electricity bill
    public void deleteElectricityBill(Long billId) {

        ElectricityBill existingBill =
                electricityBillRepository.findById(billId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Electricity bill not found with id: "
                                                + billId
                                )
                        );

        electricityBillRepository.delete(existingBill);
    }
}