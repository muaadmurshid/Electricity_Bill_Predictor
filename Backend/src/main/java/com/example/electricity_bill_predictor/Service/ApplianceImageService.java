package com.example.electricity_bill_predictor.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class ApplianceImageService {

    private static final long MAX_FILE_SIZE =
            10L * 1024L * 1024L;

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/png",
                    "image/webp"
            );

    private final Path uploadDirectory;

    public ApplianceImageService(
            @Value("${app.upload.appliance-dir}")
            String uploadDirectory) {

        this.uploadDirectory =
                Paths.get(uploadDirectory)
                        .toAbsolutePath()
                        .normalize();

        try {
            Files.createDirectories(
                    this.uploadDirectory
            );
        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Could not create appliance image upload directory",
                    exception
            );
        }
    }

    // =========================================================
    // STORE IMAGE
    // =========================================================
    public String storeImage(
            MultipartFile file) {

        validateImage(file);

        String extension =
                getExtension(
                        file.getOriginalFilename()
                );

        String storedFilename =
                UUID.randomUUID()
                        + extension;

        Path destination =
                uploadDirectory
                        .resolve(storedFilename)
                        .normalize();

        /*
         * Prevent path traversal.
         */
        if (!destination.startsWith(
                uploadDirectory
        )) {

            throw new IllegalArgumentException(
                    "Invalid image file path"
            );
        }

        try {

            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Failed to store appliance image",
                    exception
            );
        }

        /*
         * Save only the generated filename
         * in the database, not the full
         * computer-specific filesystem path.
         */
        return storedFilename;
    }

    // =========================================================
    // LOAD IMAGE
    // =========================================================
    public Resource loadImage(
            String storedFilename) {

        if (storedFilename == null ||
                storedFilename.isBlank()) {

            throw new IllegalArgumentException(
                    "Appliance image is not available"
            );
        }

        Path imagePath =
                uploadDirectory
                        .resolve(storedFilename)
                        .normalize();

        if (!imagePath.startsWith(
                uploadDirectory
        )) {

            throw new IllegalArgumentException(
                    "Invalid appliance image path"
            );
        }

        try {

            Resource resource =
                    new UrlResource(
                            imagePath.toUri()
                    );

            if (!resource.exists() ||
                    !resource.isReadable()) {

                throw new IllegalArgumentException(
                        "Appliance image could not be found"
                );
            }

            return resource;

        } catch (MalformedURLException exception) {

            throw new IllegalArgumentException(
                    "Invalid appliance image path",
                    exception
            );
        }
    }

    // =========================================================
    // DELETE IMAGE
    // =========================================================
    public void deleteImage(
            String storedFilename) {

        if (storedFilename == null ||
                storedFilename.isBlank()) {

            return;
        }

        Path imagePath =
                uploadDirectory
                        .resolve(storedFilename)
                        .normalize();

        if (!imagePath.startsWith(
                uploadDirectory
        )) {

            return;
        }

        try {

            Files.deleteIfExists(
                    imagePath
            );

        } catch (IOException exception) {

            throw new IllegalStateException(
                    "Failed to delete appliance image",
                    exception
            );
        }
    }

    // =========================================================
    // VALIDATION
    // =========================================================
    private void validateImage(
            MultipartFile file) {

        if (file == null ||
                file.isEmpty()) {

            throw new IllegalArgumentException(
                    "Please select an appliance image"
            );
        }

        if (file.getSize() >
                MAX_FILE_SIZE) {

            throw new IllegalArgumentException(
                    "Appliance image must be 10 MB or smaller"
            );
        }

        String contentType =
                file.getContentType();

        if (contentType == null ||
                !ALLOWED_CONTENT_TYPES
                        .contains(
                                contentType.toLowerCase()
                        )) {

            throw new IllegalArgumentException(
                    "Only JPG, PNG and WEBP appliance images are supported"
            );
        }
    }

    // =========================================================
    // FILE EXTENSION
    // =========================================================
    private String getExtension(
            String originalFilename) {

        if (originalFilename == null ||
                originalFilename.isBlank()) {

            return ".jpg";
        }

        String lower =
                originalFilename
                        .toLowerCase();

        if (lower.endsWith(
                ".jpeg"
        )) {

            return ".jpeg";
        }

        if (lower.endsWith(
                ".png"
        )) {

            return ".png";
        }

        if (lower.endsWith(
                ".webp"
        )) {

            return ".webp";
        }

        return ".jpg";
    }
}