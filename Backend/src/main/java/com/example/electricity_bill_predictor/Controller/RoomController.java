package com.example.electricity_bill_predictor.Controller;

import jakarta.validation.Valid;
import com.example.electricity_bill_predictor.Entity.Room;
import com.example.electricity_bill_predictor.Service.RoomService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = "*")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    // GET /api/rooms
    @GetMapping
    public List<Room> getAllRooms() {
        return roomService.getAllRooms();
    }

    // GET /api/rooms/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {

        Room room = roomService.getRoomById(id);

        return ResponseEntity.ok(room);
    }

    // POST /api/rooms
    @PostMapping
    public ResponseEntity<Room> createRoom(
            @Valid @RequestBody Room room) {

        Room createdRoom = roomService.createRoom(room);
        return ResponseEntity.ok(createdRoom);
    }

    // PUT /api/rooms/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody Room room) {

        try {
            Room updatedRoom = roomService.updateRoom(id, room);

            return ResponseEntity.ok(updatedRoom);

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/rooms/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {

        try {
            roomService.deleteRoom(id);

            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}