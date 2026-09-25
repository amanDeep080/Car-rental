package com.velocira.controller;

import com.velocira.dto.agreement.AgreementResponse;
import com.velocira.dto.agreement.AgreementSubmitRequest;
import com.velocira.service.RentalAgreementService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings/{reference}/agreement")
@RequiredArgsConstructor
public class RentalAgreementController {

    private final RentalAgreementService agreementService;

    @PostMapping
    public ResponseEntity<AgreementResponse> submit(
        @PathVariable String reference,
        @Valid @RequestBody AgreementSubmitRequest request,
        HttpServletRequest httpRequest
    ) {
        return ResponseEntity.ok(agreementService.submit(reference, request, httpRequest.getRemoteAddr()));
    }

    @GetMapping
    public ResponseEntity<AgreementResponse> get(@PathVariable String reference) {
        return ResponseEntity.ok(agreementService.get(reference));
    }
}
