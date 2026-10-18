package com.sxmxdx.backend.controller.comparaison;

import com.sxmxdx.backend.dto.comparaison.ComparaisonProspectiveDTO;
import com.sxmxdx.backend.service.comparaison.ComparaisonProspectiveService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comparaisons/prospective")
@CrossOrigin(origins = "http://localhost:3000")
public class ComparaisonProspectiveController {

    private final ComparaisonProspectiveService service;

    public ComparaisonProspectiveController(
        ComparaisonProspectiveService service
    ) {
        this.service = service;
    }

    // Budgets générés disponibles
    @GetMapping("/budgets")
    public List<Integer> budgetsDisponibles() {
        return service.getBudgetsDisponibles();
    }

    // Prévisions disponibles
    @GetMapping("/previsions")
    public List<Integer> previsionsDisponibles() {
        return service.getPrevisionsDisponibles();
    }

    // Comparaison prospective avec auteur
    @GetMapping(produces = "application/json")
    public ComparaisonProspectiveDTO comparer(
        @RequestParam Integer anneeBudget,
        @RequestParam Integer anneePrevision,
        @RequestParam Integer auteurId
    ) {
        return service.comparer(
            anneeBudget,
            anneePrevision,
            auteurId
        );
    }
}

