package com.sxmxdx.backend.controller.exercice;

import com.sxmxdx.backend.dto.exercice.ExerciceDTO;
import com.sxmxdx.backend.service.exercice.ExerciceService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercices")
@CrossOrigin(origins = "*")
public class ExerciceController {

    private final ExerciceService service;

    public ExerciceController(
        ExerciceService service
    ) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ExerciceDTO>> rechercher(
        @RequestParam(required = false) Integer annee
    ) {
        return ResponseEntity.ok(
            service.rechercher(annee)
        );
    }

    @GetMapping("/annees")
    public ResponseEntity<List<Integer>> rechercherAnnees() {

        return ResponseEntity.ok(
            service.rechercherAnnees()
        );
    }
}