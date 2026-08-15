package com.example.electricity_bill_predictor.Controller;

import com.example.electricity_bill_predictor.Entity.Room;
import com.example.electricity_bill_predictor.Service.RoomService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(
            RoomService roomService) {

        this.roomService = roomService;
    }

    // GET /api/rooms
    // Returns only rooms belonging to logged-in user
    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {

        return ResponseEntity.ok(
                roomService.getAllRooms()
        );
    }

    // GET /api/rooms/household/{householdId}
    // Returns rooms for one owned household
    @GetMapping("/household/{householdId}")
    public ResponseEntity<List<Room>>
    getRoomsByHouseholdId(
            @PathVariable Long householdId) {

        return ResponseEntity.ok(
                roomService.getRoomsByHouseholdId(
                        householdId
                )
        );
    }

    // GET /api/rooms/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                roomService.getRoomById(id)
        );
    }

    // POST /api/rooms
    @PostMapping
    public ResponseEntity<Room> createRoom(
            @Valid @RequestBody Room room) {

        return ResponseEntity.ok(
                roomService.createRoom(room)
        );
    }

    // PUT /api/rooms/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody Room room) {

        return ResponseEntity.ok(
                roomService.updateRoom(
                        id,
                        room
                )
        );
    }

    // DELETE /api/rooms/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable Long id) {

        roomService.deleteRoom(id);

        return ResponseEntity.noContent().build();
    }
}