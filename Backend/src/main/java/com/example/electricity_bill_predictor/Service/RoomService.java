package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.Entity.Household;
import com.example.electricity_bill_predictor.Entity.Room;
import com.example.electricity_bill_predictor.Repository.HouseholdRepository;
import com.example.electricity_bill_predictor.Repository.RoomRepository;
import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final HouseholdRepository householdRepository;
    private final CurrentUserService currentUserService;

    public RoomService(
            RoomRepository roomRepository,
            HouseholdRepository householdRepository,
            CurrentUserService currentUserService) {

        this.roomRepository = roomRepository;
        this.householdRepository = householdRepository;
        this.currentUserService = currentUserService;
    }

    // =========================================================
    // GET ALL ROOMS FOR CURRENT LOGGED-IN USER
    // =========================================================
    public List<Room> getAllRooms() {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        return roomRepository
                .findByHouseholdUserUserId(currentUserId);
    }

    // =========================================================
    // GET ROOMS FOR ONE HOUSEHOLD
    // Household must belong to current user
    // =========================================================
    public List<Room> getRoomsByHouseholdId(
            Long householdId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Household household =
                getOwnedHousehold(
                        householdId,
                        currentUserId
                );

        return roomRepository
                .findByHouseholdHouseholdIdAndHouseholdUserUserId(
                        household.getHouseholdId(),
                        currentUserId
                );
    }

    // =========================================================
    // GET ROOM BY ID
    // Only owner can access
    // =========================================================
    public Room getRoomById(Long roomId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Room room =
                roomRepository.findById(roomId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Room not found with id: "
                                                + roomId
                                )
                        );

        validateRoomOwnership(
                room,
                currentUserId
        );

        return room;
    }

    // =========================================================
    // CREATE ROOM
    // Can only create inside own household
    // =========================================================
    public Room createRoom(Room room) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        if (room.getHousehold() == null ||
                room.getHousehold().getHouseholdId() == null) {

            throw new IllegalArgumentException(
                    "Household is required"
            );
        }

        Long householdId =
                room.getHousehold().getHouseholdId();

        Household household =
                getOwnedHousehold(
                        householdId,
                        currentUserId
                );

        room.setHousehold(household);

        return roomRepository.save(room);
    }

    // =========================================================
    // UPDATE ROOM
    // Only owner can update
    // Room cannot be moved to another user's household
    // =========================================================
    public Room updateRoom(
            Long roomId,
            Room roomDetails) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Room existingRoom =
                roomRepository.findById(roomId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Room not found with id: "
                                                + roomId
                                )
                        );

        validateRoomOwnership(
                existingRoom,
                currentUserId
        );

        /*
         * If frontend sends a household,
         * make sure that household also belongs
         * to the logged-in user.
         */
        if (roomDetails.getHousehold() != null &&
                roomDetails.getHousehold().getHouseholdId() != null) {

            Long newHouseholdId =
                    roomDetails
                            .getHousehold()
                            .getHouseholdId();

            Household ownedHousehold =
                    getOwnedHousehold(
                            newHouseholdId,
                            currentUserId
                    );

            existingRoom.setHousehold(
                    ownedHousehold
            );
        }

        existingRoom.setRoomName(
                roomDetails.getRoomName()
        );

        existingRoom.setRoomType(
                roomDetails.getRoomType()
        );

        existingRoom.setDescription(
                roomDetails.getDescription()
        );

        return roomRepository.save(
                existingRoom
        );
    }

    // =========================================================
    // DELETE ROOM
    // Only owner can delete
    // =========================================================
    public void deleteRoom(Long roomId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Room existingRoom =
                roomRepository.findById(roomId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Room not found with id: "
                                                + roomId
                                )
                        );

        validateRoomOwnership(
                existingRoom,
                currentUserId
        );

        roomRepository.delete(
                existingRoom
        );
    }

    // =========================================================
    // HOUSEHOLD OWNERSHIP CHECK
    // =========================================================
    private Household getOwnedHousehold(
            Long householdId,
            Long currentUserId) {

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        if (household.getUser() == null ||
                household.getUser().getUserId() == null ||
                !household.getUser()
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
    // ROOM OWNERSHIP CHECK
    // =========================================================
    private void validateRoomOwnership(
            Room room,
            Long currentUserId) {

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
                            + room.getRoomId()
            );
        }
    }
}