package com.velocira.controller;

import com.velocira.dto.booking.BookingCreateRequest;
import com.velocira.dto.booking.BookingResponse;
import com.velocira.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(request));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> myBookings() {
        return ResponseEntity.ok(bookingService.getMyBookings());
    }

    @GetMapping("/{reference}")
    public ResponseEntity<BookingResponse> getOne(@PathVariable String reference) {
        return ResponseEntity.ok(bookingService.getByReference(reference));
    }

    @PostMapping("/{reference}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable String reference) {
        bookingService.cancelBooking(reference);
        return ResponseEntity.noContent().build();
    }
}
