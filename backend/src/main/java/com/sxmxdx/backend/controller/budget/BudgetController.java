package com.sxmxdx.backend.controller.budget;

import com.sxmxdx.backend.service.budget.BudgetService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:3000")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(
            BudgetService budgetService
    ) {
        this.budgetService = budgetService;
    }

//     @PostMapping("/generer")
//     public ResponseEntity<Map<?, ?>> genererBudget() {

//         System.out.println(
//                 "[BUDGET] Demande de génération reçue."
//         );

//         Map<?, ?> resultat =
//                 budgetService.genererBudget();

//         return ResponseEntity.ok(
//                 resultat
//         );
//     }


        @PostMapping("/generer")
        public Map<?, ?> genererBudget(
                @RequestParam Integer auteurId
        ) {
        return budgetService.genererBudget(auteurId);
        }
}