package com.velocira.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(@Value("${app.storage.cloudinary-url:}") String cloudinaryUrl) {
        if (cloudinaryUrl == null || !cloudinaryUrl.startsWith("cloudinary://")) {
            log.warn("Invalid or missing CLOUDINARY_URL environment variable! Image uploads will fail.");
            this.cloudinary = null;
        } else {
            this.cloudinary = new Cloudinary(cloudinaryUrl);
            log.info("Cloudinary service initialized with cloud name: {}", cloudinary.config.cloudName);
        }
    }

    public String uploadImage(MultipartFile file, String folder) throws IOException {
        if (cloudinary == null) {
            throw new IOException("Cloudinary is not configured. Please set the CLOUDINARY_URL environment variable.");
        }
        try {
            log.debug("Attempting to upload file to folder: {}", folder);
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "auto"
                ));
            String url = (String) uploadResult.get("secure_url");
            if (url == null) {
                log.error("Cloudinary upload result missing secure_url: {}", uploadResult);
                throw new IOException("Failed to get URL from Cloudinary");
            }
            return url;
        } catch (Exception e) {
            log.error("Cloudinary upload failed: {}", e.getMessage());

            // Specific handling for the permission error seen in logs
            if (e.getMessage().contains("missing permissions") || e.getMessage().contains("Request forbidden")) {
                throw new IOException("Cloudinary upload failed: Permission denied. " +
                    "Please ensure your API Key has 'Upload/Create' permissions enabled in your Cloudinary Dashboard (Settings -> Security).");
            }

            throw new IOException("Cloudinary upload failed: " + e.getMessage());
        }
    }
}
