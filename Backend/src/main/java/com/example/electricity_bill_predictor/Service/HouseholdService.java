package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.Entity.Household;
import com.example.electricity_bill_predictor.Entity.User;
import com.example.electricity_bill_predictor.Repository.HouseholdRepository;
import com.example.electricity_bill_predictor.Repository.UserRepository;
import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HouseholdService {

    private final HouseholdRepository householdRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public HouseholdService(
            HouseholdRepository householdRepository,
            UserRepository userRepository,
            CurrentUserService currentUserService) {

        this.householdRepository = householdRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    // =========================================================
    // GET ALL HOUSEHOLDS FOR CURRENT LOGGED-IN USER
    // =========================================================
    public List<Household> getAllHouseholds() {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        return householdRepository
                .findByUserUserId(currentUserId);
    }

    // =========================================================
    // GET HOUSEHOLD BY ID
    // Only owner can access it
    // =========================================================
    public Household getHouseholdById(Long householdId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        validateOwnership(
                household,
                currentUserId
        );

        return household;
    }

    // =========================================================
    // CREATE HOUSEHOLD
    // Household automatically belongs to logged-in user
    // =========================================================
    public Household createHousehold(
            Household household) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        User currentUser =
                userRepository.findById(currentUserId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found with id: "
                                                + currentUserId
                                )
                        );

        /*
         * IMPORTANT:
         * Ignore any user sent from frontend.
         * The household always belongs to the
         * currently authenticated user.
         */
        household.setUser(currentUser);

        return householdRepository.save(household);
    }

    // =========================================================
    // UPDATE HOUSEHOLD
    // Only owner can update
    // User ownership cannot be changed
    // =========================================================
    public Household updateHousehold(
            Long householdId,
            Household householdDetails) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Household existingHousehold =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        validateOwnership(
                existingHousehold,
                currentUserId
        );

        /*
         * Do NOT update the User.
         *
         * This prevents a household from being
         * transferred to another user by changing
         * userId in the request.
         */

        existingHousehold.setHouseholdName(
                householdDetails.getHouseholdName()
        );

        existingHousehold.setLocation(
                householdDetails.getLocation()
        );

        existingHousehold.setHouseType(
                householdDetails.getHouseType()
        );

        existingHousehold.setNumberOfResidents(
                householdDetails.getNumberOfResidents()
        );

        return householdRepository.save(
                existingHousehold
        );
    }

    // =========================================================
    // DELETE HOUSEHOLD
    // Only owner can delete
    // =========================================================
    public void deleteHousehold(
            Long householdId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Household existingHousehold =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        validateOwnership(
                existingHousehold,
                currentUserId
        );

        householdRepository.delete(
                existingHousehold
        );
    }

    // =========================================================
    // OWNERSHIP CHECK
    // =========================================================
    private void validateOwnership(
            Household household,
            Long currentUserId) {

        if (household.getUser() == null ||
                household.getUser().getUserId() == null ||
                !household.getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Household not found with id: "
                            + household.getHouseholdId()
            );
        }
    }
}