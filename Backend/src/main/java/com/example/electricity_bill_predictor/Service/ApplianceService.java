package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.Entity.Appliance;
import com.example.electricity_bill_predictor.Entity.ApplianceCategory;
import com.example.electricity_bill_predictor.Entity.Room;
import com.example.electricity_bill_predictor.Repository.ApplianceCategoryRepository;
import com.example.electricity_bill_predictor.Repository.ApplianceRepository;
import com.example.electricity_bill_predictor.Repository.RoomRepository;
import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplianceService {

    private final ApplianceRepository applianceRepository;
    private final RoomRepository roomRepository;
    private final ApplianceCategoryRepository applianceCategoryRepository;

    public ApplianceService(
            ApplianceRepository applianceRepository,
            RoomRepository roomRepository,
            ApplianceCategoryRepository applianceCategoryRepository) {

        this.applianceRepository = applianceRepository;
        this.roomRepository = roomRepository;
        this.applianceCategoryRepository = applianceCategoryRepository;
    }

    // Get all appliances
    public List<Appliance> getAllAppliances() {
        return applianceRepository.findAll();
    }

    // Get appliance by ID
    public Appliance getApplianceById(Long id) {
        return applianceRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Appliance not found with id: " + id
                        )
                );
    }

    // Create appliance
    public Appliance createAppliance(Appliance appliance) {

        Long roomId =
                appliance.getRoom().getRoomId();

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found with id: " + roomId
                        )
                );

        Long categoryId =
                appliance.getCategory().getCategoryId();

        ApplianceCategory category =
                applianceCategoryRepository.findById(categoryId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appliance category not found with id: "
                                                + categoryId
                                )
                        );

        appliance.setRoom(room);
        appliance.setCategory(category);

        return applianceRepository.save(appliance);
    }

    // Update appliance
    public Appliance updateAppliance(
            Long applianceId,
            Appliance applianceDetails) {

        Appliance existingAppliance =
                applianceRepository.findById(applianceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appliance not found with id: "
                                                + applianceId
                                )
                        );

        Long roomId =
                applianceDetails.getRoom().getRoomId();

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found with id: " + roomId
                        )
                );

        Long categoryId =
                applianceDetails.getCategory().getCategoryId();

        ApplianceCategory category =
                applianceCategoryRepository.findById(categoryId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appliance category not found with id: "
                                                + categoryId
                                )
                        );

        existingAppliance.setRoom(room);
        existingAppliance.setCategory(category);

        existingAppliance.setApplianceName(
                applianceDetails.getApplianceName()
        );

        existingAppliance.setBrand(
                applianceDetails.getBrand()
        );

        existingAppliance.setModel(
                applianceDetails.getModel()
        );

        existingAppliance.setRatedPower(
                applianceDetails.getRatedPower()
        );

        existingAppliance.setQuantity(
                applianceDetails.getQuantity()
        );

        existingAppliance.setEnergyRating(
                applianceDetails.getEnergyRating()
        );

        existingAppliance.setTypicalDailyHours(
                applianceDetails.getTypicalDailyHours()
        );

        existingAppliance.setStatus(
                applianceDetails.getStatus()
        );

        return applianceRepository.save(existingAppliance);
    }

    // Delete appliance
    public void deleteAppliance(Long applianceId) {

        Appliance existingAppliance =
                applianceRepository.findById(applianceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appliance not found with id: "
                                                + applianceId
                                )
                        );

        applianceRepository.delete(existingAppliance);
    }
}