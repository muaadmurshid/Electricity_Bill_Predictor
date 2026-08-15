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
    private final CurrentUserService currentUserService;

    public ElectricityBillService(
            ElectricityBillRepository electricityBillRepository,
            HouseholdRepository householdRepository,
            CurrentUserService currentUserService) {

        this.electricityBillRepository =
                electricityBillRepository;

        this.householdRepository =
                householdRepository;

        this.currentUserService =
                currentUserService;
    }

    // =========================================================
    // GET ALL BILLS FOR CURRENT USER
    // =========================================================
    public List<ElectricityBill> getAllElectricityBills() {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        return electricityBillRepository
                .findByHouseholdUserUserIdOrderByBillDateDesc(
                        currentUserId
                );
    }

    // =========================================================
    // GET BILLS FOR ONE OWNED HOUSEHOLD
    // =========================================================
    public List<ElectricityBill> getBillsByHousehold(
            Long householdId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        getOwnedHousehold(
                householdId,
                currentUserId
        );

        return electricityBillRepository
                .findByHouseholdHouseholdIdAndHouseholdUserUserIdOrderByBillDateDesc(
                        householdId,
                        currentUserId
                );
    }

    // =========================================================
    // GET BILL BY ID
    // =========================================================
    public ElectricityBill getElectricityBillById(
            Long billId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        ElectricityBill bill =
                electricityBillRepository
                        .findById(billId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Electricity bill not found with id: "
                                                + billId
                                )
                        );

        validateBillOwnership(
                bill,
                currentUserId
        );

        return bill;
    }

    // =========================================================
    // CREATE BILL
    // Household must belong to logged-in user
    // =========================================================
    public ElectricityBill createElectricityBill(
            ElectricityBill electricityBill) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        if (electricityBill.getHousehold() == null ||
                electricityBill
                        .getHousehold()
                        .getHouseholdId() == null) {

            throw new IllegalArgumentException(
                    "Household is required"
            );
        }

        Long householdId =
                electricityBill
                        .getHousehold()
                        .getHouseholdId();

        Household household =
                getOwnedHousehold(
                        householdId,
                        currentUserId
                );

        electricityBill.setHousehold(
                household
        );

        return electricityBillRepository.save(
                electricityBill
        );
    }

    // =========================================================
    // UPDATE BILL
    // Only owner can update
    // =========================================================
    public ElectricityBill updateElectricityBill(
            Long billId,
            ElectricityBill electricityBillDetails) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        ElectricityBill existingBill =
                electricityBillRepository
                        .findById(billId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Electricity bill not found with id: "
                                                + billId
                                )
                        );

        validateBillOwnership(
                existingBill,
                currentUserId
        );

        /*
         * If household is supplied in the update,
         * it must also belong to the current user.
         */
        if (electricityBillDetails.getHousehold() != null &&
                electricityBillDetails
                        .getHousehold()
                        .getHouseholdId() != null) {

            Long householdId =
                    electricityBillDetails
                            .getHousehold()
                            .getHouseholdId();

            Household ownedHousehold =
                    getOwnedHousehold(
                            householdId,
                            currentUserId
                    );

            existingBill.setHousehold(
                    ownedHousehold
            );
        }

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

        return electricityBillRepository.save(
                existingBill
        );
    }

    // =========================================================
    // DELETE BILL
    // =========================================================
    public void deleteElectricityBill(
            Long billId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        ElectricityBill existingBill =
                electricityBillRepository
                        .findById(billId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Electricity bill not found with id: "
                                                + billId
                                )
                        );

        validateBillOwnership(
                existingBill,
                currentUserId
        );

        electricityBillRepository.delete(
                existingBill
        );
    }

    // =========================================================
    // HOUSEHOLD OWNERSHIP
    // =========================================================
    private Household getOwnedHousehold(
            Long householdId,
            Long currentUserId) {

        Household household =
                householdRepository
                        .findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        if (household.getUser() == null ||
                household.getUser().getUserId() == null ||
                !household
                        .getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Household not found with id: "
                            + householdId
            );
        }

        return household;
    }

    // =========================================================
    // BILL OWNERSHIP
    // =========================================================
    private void validateBillOwnership(
            ElectricityBill bill,
            Long currentUserId) {

        if (bill.getHousehold() == null ||
                bill.getHousehold().getUser() == null ||
                bill.getHousehold()
                        .getUser()
                        .getUserId() == null ||
                !bill.getHousehold()
                        .getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Electricity bill not found with id: "
                            + bill.getBillId()
            );
        }
    }
}