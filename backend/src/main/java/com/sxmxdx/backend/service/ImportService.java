// package com.sxmxdx.backend.service;

// import org.springframework.stereotype.Service;
// import org.springframework.web.multipart.MultipartFile;

// import java.io.IOException;
// import java.nio.file.Files;
// import java.nio.file.Path;
// import java.nio.file.Paths;
// import java.nio.file.StandardCopyOption;
// import java.util.Map;

// @Service
// public class ImportService {

//     private static final Path DATA_DIRECTORY =
//             Paths.get("/data");

//     private final PipelineService pipelineService;
//     private final JournalAuditService journalAuditService;

//     public ImportService(
//             PipelineService pipelineService,
//             JournalAuditService journalAuditService
//     ) {
//         this.pipelineService = pipelineService;
//         this.journalAuditService = journalAuditService;
//     }

//     public Map<?, ?> importFile(
//             MultipartFile file
//     ) throws IOException {

//         String safeFileName = null;

//         try {
//             if (file == null || file.isEmpty()) {
//                 throw new IllegalArgumentException(
//                         "Aucun fichier sélectionné."
//                 );
//             }

//             String originalFileName =
//                     file.getOriginalFilename();

//             if (originalFileName == null
//                     || originalFileName.isBlank()) {
//                 throw new IllegalArgumentException(
//                         "Nom du fichier invalide."
//                 );
//             }

//             safeFileName =
//                     Paths.get(originalFileName)
//                             .getFileName()
//                             .toString();

//             String lowerName =
//                     safeFileName.toLowerCase();

//             if (!lowerName.endsWith(".xlsx")
//                     && !lowerName.endsWith(".xlsm")) {
//                 throw new IllegalArgumentException(
//                         "Seuls les fichiers .xlsx "
//                         + "et .xlsm sont autorisés."
//                 );
//             }

//             Files.createDirectories(DATA_DIRECTORY);

//             Path destination =
//                     DATA_DIRECTORY.resolve(safeFileName);

//             Files.copy(
//                     file.getInputStream(),
//                     destination,
//                     StandardCopyOption.REPLACE_EXISTING
//             );

//             System.out.println(
//                     "[IMPORT] Fichier enregistré : "
//                             + destination
//             );

//             if (!Files.exists(destination)) {
//                 throw new IOException(
//                         "Le fichier n'a pas été "
//                         + "enregistré dans /data."
//                 );
//             }

//             System.out.println(
//                     "[IMPORT] Appel du pipeline Flask..."
//             );

//             Map<?, ?> resultat =
//                     pipelineService.importerExercice(
//                             safeFileName
//                     );

//             System.out.println(
//                     "[IMPORT] Réponse du pipeline : "
//                             + resultat
//             );

//             if (resultat == null) {
//                 throw new IllegalStateException(
//                         "Le pipeline Flask n'a retourné aucun résultat."
//                 );
//             }

//             Object success = resultat.get("success");

//             if (!Boolean.TRUE.equals(success)) {
//                 Object message = resultat.get("message");

//                 throw new IllegalStateException(
//                         "Échec de l'importation : "
//                         + (message == null
//                             ? "Le pipeline a signalé un échec."
//                             : message.toString())
//                 );
//             }

//             journalAuditService.enregistrer(
//                     null,
//                     "IMPORTATION_EXERCICE",
//                     "IMPORTATION",
//                     "Importation réussie du fichier : "
//                             + safeFileName,
//                     "IMPORT_FICHIER",
//                     null,
//                     "SUCCES"
//             );

//             return resultat;

//         } catch (IOException | RuntimeException e) {

//             try {
//                 journalAuditService.enregistrer(
//                         null,
//                         "ECHEC_IMPORTATION",
//                         "IMPORTATION",
//                         "Échec de l'importation du fichier : "
//                                 + (safeFileName == null
//                                     ? "Fichier inconnu"
//                                     : safeFileName)
//                                 + " - "
//                                 + e.getMessage(),
//                         "IMPORT_FICHIER",
//                         null,
//                         "ECHEC"
//                 );
//             } catch (Exception auditErreur) {
//                 System.err.println(
//                         "[AUDIT] Impossible d'enregistrer "
//                         + "l'échec d'importation : "
//                         + auditErreur.getMessage()
//                 );
//             }

//             throw e;
//         }
//     }
// }





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

//     private static final Path DATA_DIRECTORY = Paths.get("/data");
    private static final Path DATA_DIRECTORY = Paths.get("./data");


    private final PipelineService pipelineService;
    private final JournalAuditService journalAuditService;

    public ImportService(
            PipelineService pipelineService,
            JournalAuditService journalAuditService
    ) {
        this.pipelineService = pipelineService;
        this.journalAuditService = journalAuditService;
    }

    public Map<?, ?> importFile(
            MultipartFile file,
            Integer auteurId
    ) throws IOException {

        String safeFileName = null;

        try {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("Aucun fichier sélectionné.");
            }

            String originalFileName = file.getOriginalFilename();

            if (originalFileName == null || originalFileName.isBlank()) {
                throw new IllegalArgumentException("Nom du fichier invalide.");
            }

            safeFileName = Paths.get(originalFileName)
                    .getFileName()
                    .toString();

            String lowerName = safeFileName.toLowerCase();

            if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".xlsm")) {
                throw new IllegalArgumentException(
                        "Seuls les fichiers .xlsx et .xlsm sont autorisés."
                );
            }

            Files.createDirectories(DATA_DIRECTORY);

            Path destination = DATA_DIRECTORY.resolve(safeFileName);

            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

            System.out.println("[IMPORT] Fichier enregistré : " + destination);

            if (!Files.exists(destination)) {
                throw new IOException(
                        "Le fichier n'a pas été enregistré dans /data."
                );
            }

            System.out.println("[IMPORT] Appel du pipeline Flask...");

            Map<?, ?> resultat = pipelineService.importerExercice(safeFileName);

            System.out.println("[IMPORT] Réponse du pipeline : " + resultat);

            if (resultat == null) {
                throw new IllegalStateException(
                        "Le pipeline Flask n'a retourné aucun résultat."
                );
            }

            if (!Boolean.TRUE.equals(resultat.get("success"))) {
                Object message = resultat.get("message");

                throw new IllegalStateException(
                        "Échec de l'importation : "
                        + (message == null
                            ? "Le pipeline a signalé un échec."
                            : message.toString())
                );
            }

            enregistrerAudit(
                    auteurId,
                    "IMPORTATION_EXERCICE",
                    "Importation réussie du fichier : " + safeFileName,
                    "SUCCES"
            );

            return resultat;

        } catch (IOException | RuntimeException e) {

            enregistrerAudit(
                    auteurId,
                    "ECHEC_IMPORTATION",
                    "Échec de l'importation du fichier : "
                            + (safeFileName == null ? "Fichier inconnu" : safeFileName)
                            + " - " + e.getMessage(),
                    "ECHEC"
            );

            throw e;
        }
    }

    private void enregistrerAudit(
            Integer auteurId,
            String action,
            String description,
            String statut
    ) {
        try {
            journalAuditService.enregistrer(
                    auteurId,
                    action,
                    "IMPORTATION",
                    description,
                    "IMPORT_FICHIER",
                    null,
                    statut
            );
        } catch (Exception e) {
            System.err.println("[AUDIT] " + e.getMessage());
        }
    }
}
