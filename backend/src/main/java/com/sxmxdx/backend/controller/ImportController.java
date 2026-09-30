// package com.sxmxdx.backend.controller;

// import com.sxmxdx.backend.dto.ImportResponse;
// import com.sxmxdx.backend.service.ImportService;

// import org.springframework.http.HttpStatus;
// import org.springframework.http.MediaType;
// import org.springframework.http.ResponseEntity;

// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;

// import org.springframework.web.multipart.MultipartFile;

// @RestController
// @RequestMapping("/api/imports")
// public class ImportController {

//     private final ImportService importService;

//     public ImportController(
//             ImportService importService
//     ) {
//         this.importService = importService;
//     }

//     @PostMapping(
//             consumes = MediaType.MULTIPART_FORM_DATA_VALUE
//     )
//     public ResponseEntity<ImportResponse> importer(
//             @RequestParam("file") MultipartFile file
//     ) {

//         try {

//             String fileName =
//                     importService.saveFile(file);

//             return ResponseEntity.ok(
//                     new ImportResponse(
//                             true,
//                             "Fichier reçu avec succès.",
//                             fileName
//                     )
//             );

//         } catch (IllegalArgumentException e) {

//             return ResponseEntity
//                     .badRequest()
//                     .body(
//                             new ImportResponse(
//                                     false,
//                                     e.getMessage(),
//                                     null
//                             )
//                     );

//         } catch (Exception e) {

//             return ResponseEntity
//                     .status(
//                             HttpStatus.INTERNAL_SERVER_ERROR
//                     )
//                     .body(
//                             new ImportResponse(
//                                     false,
//                                     "Erreur pendant la réception du fichier.",
//                                     null
//                             )
//                     );
//         }
//     }
// }








// package com.sxmxdx.backend.controller;

// import com.sxmxdx.backend.dto.ImportResponse;
// import com.sxmxdx.backend.service.ImportService;

// import org.springframework.http.HttpStatus;
// import org.springframework.http.MediaType;
// import org.springframework.http.ResponseEntity;

// import org.springframework.web.bind.annotation.CrossOrigin;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;

// import org.springframework.web.multipart.MultipartFile;

// @RestController
// @RequestMapping("/api/imports")
// @CrossOrigin(
//     origins = "http://localhost:3000",
//     allowedHeaders = "*",
//     methods = {
//         org.springframework.web.bind.annotation.RequestMethod.POST,
//         org.springframework.web.bind.annotation.RequestMethod.OPTIONS
//     }
// )
// public class ImportController {

//     private final ImportService importService;

//     public ImportController(
//             ImportService importService
//     ) {
//         this.importService = importService;
//     }

//     @PostMapping(
//         consumes = MediaType.MULTIPART_FORM_DATA_VALUE
//     )
//     public ResponseEntity<ImportResponse> importer(
//             @RequestParam("file") MultipartFile file
//     ) {

//         try {

//             String fileName =
//                     importService.saveFile(file);

//             return ResponseEntity.ok(
//                 new ImportResponse(
//                     true,
//                     "Fichier reçu avec succès.",
//                     fileName
//                 )
//             );

//         } catch (IllegalArgumentException e) {

//             return ResponseEntity
//                 .badRequest()
//                 .body(
//                     new ImportResponse(
//                         false,
//                         e.getMessage(),
//                         null
//                     )
//                 );

//         } catch (Exception e) {

//             e.printStackTrace();

//             return ResponseEntity
//                 .status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(
//                     new ImportResponse(
//                         false,
//                         "Erreur pendant la réception du fichier.",
//                         null
//                     )
//                 );
//         }
//     }
// }





package com.sxmxdx.backend.controller;
import com.sxmxdx.backend.service.ImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;


@RestController
@RequestMapping("/api/imports")
@CrossOrigin(
    origins = "http://localhost:3000",
    allowedHeaders = "*",
    methods = {
        RequestMethod.POST,
        RequestMethod.OPTIONS
    }
)
public class ImportController {
    private final ImportService importService;

    public ImportController(
        ImportService importService
    ) {

        this.importService =
            importService;
    }


    @PostMapping
    public ResponseEntity<?> importerExercice(
        @RequestParam("file")
        MultipartFile file
    ) {

        try {

            if (
                file == null
                || file.isEmpty()
            ) {

                return ResponseEntity
                    .badRequest()
                    .body(
                        Map.of(
                            "success",
                            false,

                            "message",
                            "Aucun fichier Excel sélectionné."
                        )
                    );
            }

            Map<?, ?> resultat =
                importService.importFile(
                    file
                );

            return ResponseEntity
                .ok(
                    resultat
                );

        }

        catch (
            IllegalArgumentException erreur
        ) {

            return ResponseEntity
                .badRequest()
                .body(
                    Map.of(
                        "success",
                        false,

                        "message",
                        erreur.getMessage()
                    )
                );

        }

        catch (Exception erreur) {

            erreur.printStackTrace();

            String message =
                erreur.getMessage();

            if (
                message == null
                || message.isBlank()
            ) {

                message =
                    "Une erreur est survenue "
                    + "pendant l'importation.";
            }

            return ResponseEntity
                .internalServerError()
                .body(
                    Map.of(
                        "success",
                        false,

                        "message",
                        message
                    )
                );
        }
    }
}