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
    private final CurrentUserService currentUserService;

    public ApplianceService(
            ApplianceRepository applianceRepository,
            RoomRepository roomRepository,
            ApplianceCategoryRepository applianceCategoryRepository,
            CurrentUserService currentUserService) {

        this.applianceRepository = applianceRepository;
        this.roomRepository = roomRepository;
        this.applianceCategoryRepository =
                applianceCategoryRepository;
        this.currentUserService = currentUserService;
    }


    // GET ALL APPLIANCES FOR CURRENT LOGGED-IN USER

    public List<Appliance> getAllAppliances() {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        return applianceRepository
                .findByRoomHouseholdUserUserId(
                        currentUserId
                );
    }


    // GET APPLIANCES FOR ONE ROOM
    // Room must belong to current user

    public List<Appliance> getAppliancesByRoomId(
            Long roomId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Room room =
                getOwnedRoom(
                        roomId,
                        currentUserId
                );

        return applianceRepository
                .findByRoomRoomIdAndRoomHouseholdUserUserId(
                        room.getRoomId(),
                        currentUserId
                );
    }
    
    // =========================================================
    // GET APPLIANCE BY ID
    // Only owner can access
    // =========================================================

    public Appliance getApplianceById(
            Long applianceId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Appliance appliance =
                applianceRepository
                        .findById(applianceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appliance not found with id: "
                                                + applianceId
                                )
                        );

        validateApplianceOwnership(
                appliance,
                currentUserId
        );

        return appliance;
    }


    // CREATE APPLIANCE
    // Appliance can only be added to current user's room

    public Appliance createAppliance(
            Appliance appliance) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        if (appliance.getRoom() == null ||
                appliance.getRoom().getRoomId() == null) {

            throw new IllegalArgumentException(
                    "Room is required"
            );
        }

        if (appliance.getCategory() == null ||
                appliance.getCategory().getCategoryId() == null) {

            throw new IllegalArgumentException(
                    "Appliance category is required"
            );
        }

        Long roomId =
                appliance.getRoom().getRoomId();

        Room room =
                getOwnedRoom(
                        roomId,
                        currentUserId
                );

        Long categoryId =
                appliance
                        .getCategory()
                        .getCategoryId();

        ApplianceCategory category =
                getCategory(categoryId);

        appliance.setRoom(room);
        appliance.setCategory(category);

        if (appliance.getAiDetected() == null) {
         appliance.setAiDetected(false);
        }

        return applianceRepository.save(
                appliance
        );
    }

    // UPDATE APPLIANCE
    // Only owner can update
    // Cannot move appliance into another user's room

    public Appliance updateAppliance(
            Long applianceId,
            Appliance applianceDetails) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Appliance existingAppliance =
                applianceRepository
                        .findById(applianceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appliance not found with id: "
                                                + applianceId
                                )
                        );

        // Confirm logged-in user owns appliance
        validateApplianceOwnership(
                existingAppliance,
                currentUserId
        );

        /*
         * If the request contains another room,
         * verify that the new room also belongs
         * to the current user.
         */
        if (applianceDetails.getRoom() != null &&
                applianceDetails
                        .getRoom()
                        .getRoomId() != null) {

            Long newRoomId =
                    applianceDetails
                            .getRoom()
                            .getRoomId();

            Room ownedRoom =
                    getOwnedRoom(
                            newRoomId,
                            currentUserId
                    );

            existingAppliance.setRoom(
                    ownedRoom
            );
        }

        /*
         * Category is system-level/shared data.
         * User may change the appliance category
         * only to an existing category.
         */
        if (applianceDetails.getCategory() != null &&
                applianceDetails
                        .getCategory()
                        .getCategoryId() != null) {

            Long categoryId =
                    applianceDetails
                            .getCategory()
                            .getCategoryId();

            ApplianceCategory category =
                    getCategory(categoryId);

            existingAppliance.setCategory(
                    category
            );
        }

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

        existingAppliance.setVoltage(
        applianceDetails.getVoltage()

        );

        existingAppliance.setImagePath(
        applianceDetails.getImagePath()

        );

        existingAppliance.setAiDetected(
        applianceDetails.getAiDetected() != null
                ? applianceDetails.getAiDetected()
                : false

        );

        return applianceRepository.save(
                existingAppliance
        );
    }

    // =========================================================
    // DELETE APPLIANCE
    // Only owner can delete
    // =========================================================
    public void deleteAppliance(
            Long applianceId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Appliance existingAppliance =
                applianceRepository
                        .findById(applianceId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Appliance not found with id: "
                                                + applianceId
                                )
                        );

        validateApplianceOwnership(
                existingAppliance,
                currentUserId
        );

        applianceRepository.delete(
                existingAppliance
        );
    }

    // =========================================================
    // ROOM OWNERSHIP CHECK
    // =========================================================
    private Room getOwnedRoom(
            Long roomId,
            Long currentUserId) {

        Room room =
                roomRepository
                        .findById(roomId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Room not found with id: "
                                                + roomId
                                )
                        );

        if (room.getHousehold() == null ||
                room.getHousehold().getUser() == null ||
                room.getHousehold()
                        .getUser()
                        .getUserId() == null ||
                !room.getHousehold()
                        .getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Room not found with id: "
                            + roomId
            );
        }

        return room;
    }

    // =========================================================
    // APPLIANCE OWNERSHIP CHECK
    // =========================================================
    private void validateApplianceOwnership(
            Appliance appliance,
            Long currentUserId) {

        if (appliance.getRoom() == null ||
                appliance.getRoom()
                        .getHousehold() == null ||
                appliance.getRoom()
                        .getHousehold()
                        .getUser() == null ||
                appliance.getRoom()
                        .getHousehold()
                        .getUser()
                        .getUserId() == null ||
                !appliance.getRoom()
                        .getHousehold()
                        .getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Appliance not found with id: "
                            + appliance.getApplianceId()
            );
        }
    }

    // =========================================================
// UPDATE APPLIANCE IMAGE PATH
// Only the owner can update the image reference
// =========================================================
public Appliance updateApplianceImagePath(
        Long applianceId,
        String imagePath) {

    Long currentUserId =
            currentUserService.getCurrentUserId();

    Appliance appliance =
            applianceRepository
                    .findById(applianceId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Appliance not found with id: "
                                            + applianceId
                            )
                    );

    validateApplianceOwnership(
            appliance,
            currentUserId
    );

    appliance.setImagePath(
            imagePath
    );

    return applianceRepository.save(
            appliance
    );
}


// =========================================================
// REMOVE APPLIANCE IMAGE PATH
// =========================================================
public Appliance removeApplianceImagePath(
        Long applianceId) {

    return updateApplianceImagePath(
            applianceId,
            null
    );
}

    // =========================================================
    // CATEGORY VALIDATION
    // =========================================================
    private ApplianceCategory getCategory(
            Long categoryId) {

        return applianceCategoryRepository
                .findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Appliance category not found with id: "
                                        + categoryId
                        )
                );
    }
}