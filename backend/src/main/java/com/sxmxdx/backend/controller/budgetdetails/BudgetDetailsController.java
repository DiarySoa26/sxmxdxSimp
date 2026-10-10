package com.sxmxdx.backend.controller.budgetdetails;

import com.sxmxdx.backend.service.budgetdetails.BudgetDetailsService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budget-details")
@CrossOrigin(origins = "http://localhost:3000")
public class BudgetDetailsController {

    private final BudgetDetailsService service;

    public BudgetDetailsController(
            BudgetDetailsService service
    ) {
        this.service = service;
    }

    @GetMapping("/charges/{exerciceId}")
    public ResponseEntity<?> getCharges(
            @PathVariable Integer exerciceId
    ) {
        return ResponseEntity.ok(
                service.getCharges(exerciceId)
        );
    }

    @GetMapping("/exportations/{exerciceId}")
    public ResponseEntity<?> getExportations(
            @PathVariable Integer exerciceId
    ) {
        return ResponseEntity.ok(
                service.getExportations(exerciceId)
        );
    }

    @GetMapping("/frais-export/{exerciceId}")
    public ResponseEntity<?> getFraisExport(
            @PathVariable Integer exerciceId
    ) {
        return ResponseEntity.ok(
                service.getFraisExport(exerciceId)
        );
    }

    @GetMapping("/production/{exerciceId}")
    public ResponseEntity<?> getProduction(
            @PathVariable Integer exerciceId
    ) {
        return ResponseEntity.ok(
                service.getProduction(exerciceId)
        );
    }

    @GetMapping("/employes/{exerciceId}")
    public ResponseEntity<?> getEmployes(
            @PathVariable Integer exerciceId
    ) {
        return ResponseEntity.ok(
                service.getEmployes(exerciceId)
        );
    }

    @GetMapping("/budget/{exerciceId}")
    public ResponseEntity<?> getBudget(
            @PathVariable Integer exerciceId
    ) {
        return ResponseEntity.ok(
                service.getBudget(exerciceId)
        );
    }

    @GetMapping("/budget-mensuel/{budgetId}")
    public ResponseEntity<?> getBudgetM(
            @PathVariable Integer budgetId
    ) {
        return ResponseEntity.ok(
                service.getBudgetM(budgetId)
        );
    }
}