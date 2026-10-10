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

            Map<?, ?> resultat =
                    importService.importFile(
                            file
                    );

            return ResponseEntity.ok(
                    resultat
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", e.getMessage()
                            )
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message",
                                    e.getMessage() != null
                                            ? e.getMessage()
                                            : "Erreur pendant l'importation."
                            )
                    );
        }
    }
}