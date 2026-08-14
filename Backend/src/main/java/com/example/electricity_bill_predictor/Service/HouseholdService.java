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

    public HouseholdService(
            HouseholdRepository householdRepository,
            UserRepository userRepository) {

        this.householdRepository = householdRepository;
        this.userRepository = userRepository;
    }

    // Get all households
    public List<Household> getAllHouseholds() {
        return householdRepository.findAll();
    }

    // Get household by ID
    public Household getHouseholdById(Long id) {

        return householdRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Household not found with id: " + id
                        )
                );
    }

    // Create household
    public Household createHousehold(Household household) {

        Long userId = household.getUser().getUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId
                        )
                );

        // Use the actual User entity from the database
        household.setUser(user);

        return householdRepository.save(household);
    }

    // Update household
    public Household updateHousehold(
            Long householdId,
            Household householdDetails) {

        Household existingHousehold =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        Long userId =
                householdDetails.getUser().getUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId
                        )
                );

        existingHousehold.setUser(user);

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

        return householdRepository.save(existingHousehold);
    }

    // Delete household
    public void deleteHousehold(Long householdId) {

        Household existingHousehold =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        householdRepository.delete(existingHousehold);
    }
}