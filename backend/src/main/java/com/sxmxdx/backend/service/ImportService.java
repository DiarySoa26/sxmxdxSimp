package com.sxmxdx.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class ImportService {

    private static final Path UPLOAD_DIRECTORY =
            // Paths.get("/data/uploads");
            Paths.get("/data");

    public String saveFile(MultipartFile file)
            throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Aucun fichier n'a été sélectionné."
            );
        }

        String originalFileName =
                file.getOriginalFilename();

        if (originalFileName == null ||
                originalFileName.isBlank()) {

            throw new IllegalArgumentException(
                    "Nom du fichier invalide."
            );
        }

        /*
         * Évite qu'un nom envoyé par le client
         * contienne un chemin.
         */
        String fileName = Paths
                .get(originalFileName)
                .getFileName()
                .toString();

        String lowerName =
                fileName.toLowerCase();

        if (!lowerName.endsWith(".xlsx")
                && !lowerName.endsWith(".xlsm")) {

            throw new IllegalArgumentException(
                    "Le fichier doit être au format .xlsx ou .xlsm."
            );
        }

        Files.createDirectories(
                UPLOAD_DIRECTORY
        );

        Path destination =
                UPLOAD_DIRECTORY.resolve(fileName);

        Files.copy(
                file.getInputStream(),
                destination,
                StandardCopyOption.REPLACE_EXISTING
        );

        return fileName;
    }
}