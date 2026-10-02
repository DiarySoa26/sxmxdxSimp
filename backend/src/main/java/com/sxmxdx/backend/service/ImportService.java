package com.sxmxdx.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;

@Service
public class ImportService {

    private static final Path DATA_DIRECTORY =
            Paths.get("/data");

    private final PipelineService pipelineService;

    public ImportService(
            PipelineService pipelineService
    ) {
        this.pipelineService = pipelineService;
    }

    public Map<?, ?> importFile(
            MultipartFile file
    ) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Aucun fichier sélectionné."
            );
        }

        String originalFileName =
                file.getOriginalFilename();

        if (originalFileName == null
                || originalFileName.isBlank()) {

            throw new IllegalArgumentException(
                    "Nom du fichier invalide."
            );
        }

        String safeFileName =
                Paths.get(originalFileName)
                        .getFileName()
                        .toString();

        String lowerName =
                safeFileName.toLowerCase();

        if (!lowerName.endsWith(".xlsx")
                && !lowerName.endsWith(".xlsm")) {

            throw new IllegalArgumentException(
                    "Seuls les fichiers .xlsx "
                    + "et .xlsm sont autorisés."
            );
        }

        Files.createDirectories(
                DATA_DIRECTORY
        );

        Path destination =
                DATA_DIRECTORY.resolve(
                        safeFileName
                );

        Files.copy(
                file.getInputStream(),
                destination,
                StandardCopyOption.REPLACE_EXISTING
        );

        System.out.println(
                "[IMPORT] Fichier enregistré : "
                        + destination
        );
        if (!Files.exists(destination)) {
            throw new IOException(
                    "Le fichier n'a pas été "
                    + "enregistré dans /data."
            );
        }

        System.out.println(
                "[IMPORT] Appel du pipeline Flask..."
        );

        Map<?, ?> resultat =
                pipelineService.importerExercice(
                        safeFileName
                );

        System.out.println(
                "[IMPORT] Réponse du pipeline : "
                        + resultat
        );

        return resultat;
    }
}