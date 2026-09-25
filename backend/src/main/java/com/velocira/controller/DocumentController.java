package com.velocira.controller;

import com.velocira.dto.document.DocumentResponse;
import com.velocira.dto.document.DocumentUploadRequest;
import com.velocira.service.CloudinaryService;
import com.velocira.service.DocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        log.info("Processing document file upload: {} ({} bytes)", file.getOriginalFilename(), file.getSize());
        String url = cloudinaryService.uploadImage(file, "documents");
        log.info("Document file uploaded to Cloudinary: {}", url);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @PostMapping
    public ResponseEntity<DocumentResponse> record(@Valid @RequestBody DocumentUploadRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentService.upload(request));
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> myDocuments() {
        return ResponseEntity.ok(documentService.myDocuments());
    }
}
