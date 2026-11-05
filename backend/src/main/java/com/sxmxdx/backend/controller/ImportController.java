// package com.sxmxdx.backend.controller;
// import com.sxmxdx.backend.service.ImportService;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.CrossOrigin;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestMethod;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.multipart.MultipartFile;

// import java.util.Map;


// @RestController
// @RequestMapping("/api/imports")
// @CrossOrigin(
//     origins = "http://localhost:3000",
//     allowedHeaders = "*",
//     methods = {
//         RequestMethod.POST,
//         RequestMethod.OPTIONS
//     }
// )
// public class ImportController {
//     private final ImportService importService;

//     public ImportController(
//         ImportService importService
//     ) {

//         this.importService =
//             importService;
//     }


//     @PostMapping
//     public ResponseEntity<?> importerExercice(
//             @RequestParam("file") MultipartFile file,
//              @RequestParam Integer auteurId
//     ) {

//         try {

//             Map<?, ?> resultat =
//                     importService.importFile(file, auteurId);

//             return ResponseEntity.ok(
//                     resultat
//             );

//         } catch (IllegalArgumentException e) {

//             return ResponseEntity
//                     .badRequest()
//                     .body(
//                             Map.of(
//                                     "success", false,
//                                     "message", e.getMessage()
//                             )
//                     );

//         } catch (Exception e) {

//             e.printStackTrace();

//             return ResponseEntity
//                     .internalServerError()
//                     .body(
//                             Map.of(
//                                     "success", false,
//                                     "message",
//                                     e.getMessage() != null
//                                             ? e.getMessage()
//                                             : "Erreur pendant l'importation."
//                             )
//                     );
//         }
//     }
// }









// package com.sxmxdx.backend.controller;
// import com.sxmxdx.backend.service.ImportService;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.CrossOrigin;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestMethod;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.multipart.MultipartFile;

// import java.util.Map;


// @RestController
// @RequestMapping("/api/imports")
// @CrossOrigin(
//     origins = "http://localhost:3000",
//     allowedHeaders = "*",
//     methods = {
//         RequestMethod.POST,
//         RequestMethod.OPTIONS
//     }
// )
// public class ImportController {
//     private final ImportService importService;

//     public ImportController(
//         ImportService importService
//     ) {

//         this.importService =
//             importService;
//     }


//     @PostMapping
//     public ResponseEntity<?> importerExercice(
//             @RequestParam("file") MultipartFile file,
//              @RequestParam Integer auteurId
//     ) {

//         try {

//             Map<?, ?> resultat =
//                     importService.importFile(file, auteurId);

//             return ResponseEntity.ok(
//                     resultat
//             );

//         } catch (IllegalArgumentException e) {

//             return ResponseEntity
//                     .badRequest()
//                     .body(
//                             Map.of(
//                                     "success", false,
//                                     "message", e.getMessage()
//                             )
//                     );

//         } catch (Exception e) {

//             e.printStackTrace();

//             return ResponseEntity
//                     .internalServerError()
//                     .body(
//                             Map.of(
//                                     "success", false,
//                                     "message",
//                                     e.getMessage() != null
//                                             ? e.getMessage()
//                                             : "Erreur pendant l'importation."
//                             )
//                     );
//         }
//     }
// }











package com.sxmxdx.backend.controller;

import com.sxmxdx.backend.service.ImportService;
import com.sxmxdx.backend.service.PipelineService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/imports")
@CrossOrigin(
        origins = "http://localhost:3000",
        allowedHeaders = "*",
        exposedHeaders = {"Content-Disposition"},
        methods = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.OPTIONS
        }
)
public class ImportController {

    private final ImportService importService;
    private final PipelineService pipelineService;

    public ImportController(
            ImportService importService,
            PipelineService pipelineService
    ) {
        this.importService = importService;
        this.pipelineService = pipelineService;
    }

    @PostMapping
    public ResponseEntity<?> importerExercice(
            @RequestParam("file") MultipartFile file,
            @RequestParam Integer auteurId
    ) {
        try {
            Map<?, ?> resultat =
                    importService.importFile(file, auteurId);

            return ResponseEntity.ok(resultat);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message", messageErreur(
                                    e, "Paramètres d'importation invalides."
                            )
                    )
            );

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "success", false,
                            "message", messageErreur(
                                    e, "Erreur pendant l'importation."
                            )
                    )
            );
        }
    }

    @GetMapping("/{importId}/fichier")
    public ResponseEntity<?> telechargerFichier(
            @PathVariable Integer importId
    ) {
        try {
            if (importId == null || importId <= 0) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "success", false,
                                "message", "Identifiant d'import invalide."
                        )
                );
            }

            ResponseEntity<byte[]> response =
                    pipelineService.telechargerFichier(importId);

            HttpHeaders headers = new HttpHeaders();

            MediaType contentType =
                    response.getHeaders().getContentType();

            headers.setContentType(
                    contentType != null
                            ? contentType
                            : MediaType.APPLICATION_OCTET_STREAM
            );

            String disposition = response.getHeaders()
                    .getFirst(HttpHeaders.CONTENT_DISPOSITION);

            if (disposition != null) {
                headers.set(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposition
                );
            }

            byte[] contenu = response.getBody();

            if (contenu == null) {
                throw new IllegalStateException(
                        "Le pipeline Flask a retourné un fichier vide."
                );
            }

            headers.setContentLength(contenu.length);

            return new ResponseEntity<>(
                    contenu,
                    headers,
                    response.getStatusCode()
            );

        } catch (RestClientResponseException e) {
            System.err.println(
                    "[IMPORT] Erreur Flask : "
                            + e.getResponseBodyAsString()
            );

            String message = switch (e.getStatusCode().value()) {
                case 404 -> "Import ou fichier Excel introuvable.";
                case 400 -> "Demande de téléchargement invalide.";
                default -> "Erreur du pipeline pendant le téléchargement.";
            };

            return ResponseEntity.status(e.getStatusCode()).body(
                    Map.of(
                            "success", false,
                            "message", message
                    )
            );

        } catch (ResourceAccessException e) {
            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message",
                                    "Le serveur Flask est inaccessible."
                            )
                    );

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "success", false,
                            "message",
                            "Erreur pendant le téléchargement."
                    )
            );
        }
    }

    private String messageErreur(
            Exception e,
            String messageParDefaut
    ) {
        return e.getMessage() != null
                && !e.getMessage().isBlank()
                ? e.getMessage()
                : messageParDefaut;
    }
}
