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

    public RoomService(
            RoomRepository roomRepository,
            HouseholdRepository householdRepository) {

        this.roomRepository = roomRepository;
        this.householdRepository = householdRepository;
    }

    // Get all rooms
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    // Get room by ID
    public Room getRoomById(Long id) {

        return roomRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found with id: " + id
                        )
                );
    }

    // Create room
    public Room createRoom(Room room) {

        Long householdId =
                room.getHousehold().getHouseholdId();

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        room.setHousehold(household);

        return roomRepository.save(room);
    }

    // Update room
    public Room updateRoom(
            Long roomId,
            Room roomDetails) {

        Room existingRoom =
                roomRepository.findById(roomId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Room not found with id: " + roomId
                                )
                        );

        Long householdId =
                roomDetails.getHousehold().getHouseholdId();

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        existingRoom.setHousehold(household);

        existingRoom.setRoomName(
                roomDetails.getRoomName()
        );

        existingRoom.setRoomType(
                roomDetails.getRoomType()
        );

        existingRoom.setDescription(
                roomDetails.getDescription()
        );

        return roomRepository.save(existingRoom);
    }

    // Delete room
    public void deleteRoom(Long roomId) {

        Room existingRoom =
                roomRepository.findById(roomId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Room not found with id: " + roomId
                                )
                        );

        roomRepository.delete(existingRoom);
    }
}