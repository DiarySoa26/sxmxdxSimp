// package com.sxmxdx.backend.controller.budgetdetails;

// import com.sxmxdx.backend.service.budgetdetails.BudgetDetailsService;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/budget-details")
// @CrossOrigin(origins = "http://localhost:3000")
// public class BudgetDetailsController {

//     private final BudgetDetailsService service;

//     public BudgetDetailsController(BudgetDetailsService service) {
//         this.service = service;
//     }

//     @GetMapping("/charges/{exerciceId}")
//     public ResponseEntity<?> getCharges(
//             @PathVariable Integer exerciceId,
//             @RequestParam Integer auteurId
//     ) {
//         return ResponseEntity.ok(service.getCharges(exerciceId, auteurId));
//     }

//     @GetMapping("/exportations/{exerciceId}")
//     public ResponseEntity<?> getExportations(
//             @PathVariable Integer exerciceId,
//             @RequestParam Integer auteurId
//     ) {
//         return ResponseEntity.ok(service.getExportations(exerciceId, auteurId));
//     }

//     @GetMapping("/frais-export/{exerciceId}")
//     public ResponseEntity<?> getFraisExport(
//             @PathVariable Integer exerciceId,
//             @RequestParam Integer auteurId
//     ) {
//         return ResponseEntity.ok(service.getFraisExport(exerciceId, auteurId));
//     }

//     @GetMapping("/production/{exerciceId}")
//     public ResponseEntity<?> getProduction(
//             @PathVariable Integer exerciceId,
//             @RequestParam Integer auteurId
//     ) {
//         return ResponseEntity.ok(service.getProduction(exerciceId, auteurId));
//     }

//     @GetMapping("/employes/{exerciceId}")
//     public ResponseEntity<?> getEmployes(
//             @PathVariable Integer exerciceId,
//             @RequestParam Integer auteurId
//     ) {
//         return ResponseEntity.ok(service.getEmployes(exerciceId, auteurId));
//     }

//     @GetMapping("/budget/{exerciceId}")
//     public ResponseEntity<?> getBudget(
//             @PathVariable Integer exerciceId,
//             @RequestParam Integer auteurId
//     ) {
//         return ResponseEntity.ok(service.getBudget(exerciceId, auteurId));
//     }

//     @GetMapping("/budget-mensuel/{budgetId}")
//     public ResponseEntity<?> getBudgetM(
//             @PathVariable Integer budgetId,
//             @RequestParam Integer auteurId
//     ) {
//         return ResponseEntity.ok(service.getBudgetM(budgetId, auteurId));
//     }
// }





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
            @PathVariable Integer exerciceId,
            @RequestParam Integer auteurId
    ) {
        return ResponseEntity.ok(
                service.getCharges(exerciceId, auteurId)
        );
    }


    @GetMapping("/exportations/{exerciceId}")
    public ResponseEntity<?> getExportations(
            @PathVariable Integer exerciceId,
            @RequestParam Integer auteurId
    ) {
        return ResponseEntity.ok(
                service.getExportations(exerciceId, auteurId)
        );
    }


    @GetMapping("/frais-export/{exerciceId}")
    public ResponseEntity<?> getFraisExport(
            @PathVariable Integer exerciceId,
            @RequestParam Integer auteurId
    ) {
        return ResponseEntity.ok(
                service.getFraisExport(exerciceId, auteurId)
        );
    }


    @GetMapping("/production/{exerciceId}")
    public ResponseEntity<?> getProduction(
            @PathVariable Integer exerciceId,
            @RequestParam Integer auteurId
    ) {
        return ResponseEntity.ok(
                service.getProduction(exerciceId, auteurId)
        );
    }


    @GetMapping("/employes/{exerciceId}")
    public ResponseEntity<?> getEmployes(
            @PathVariable Integer exerciceId,
            @RequestParam Integer auteurId
    ) {
        return ResponseEntity.ok(
                service.getEmployes(exerciceId, auteurId)
        );
    }

    @GetMapping("/budget/{exerciceId}")
    public ResponseEntity<?> getBudget(
            @PathVariable Integer exerciceId,
            @RequestParam Integer auteurId
    ) {
        return ResponseEntity.ok(
                service.getBudget(exerciceId, auteurId)
        );
    }

    @GetMapping("/budget-mensuel/{budgetId}")
    public ResponseEntity<?> getBudgetM(
            @PathVariable Integer budgetId,
            @RequestParam Integer auteurId
    ) {
        return ResponseEntity.ok(
                service.getBudgetM(budgetId, auteurId)
        );
    }


    @GetMapping("/amortissements/{exerciceId}")
    public ResponseEntity<?> getAmortissements(
            @PathVariable Integer exerciceId,
            @RequestParam Integer auteurId
    ) {
        return ResponseEntity.ok(
                service.getAmortissements(exerciceId, auteurId)
        );
    }

    @GetMapping("/amortissements-totaux/{exerciceId}")
    public ResponseEntity<?> getAmortissementsTotaux(
            @PathVariable Integer exerciceId,
            @RequestParam Integer auteurId
    ) {
        return ResponseEntity.ok(
                service.getAmortissementsTotaux(exerciceId, auteurId)
        );
    }

    @GetMapping("/amortissements-annuel/{exerciceId}")
    public ResponseEntity<?> getAmortissementsAnnuel(
            @PathVariable Integer exerciceId,
            @RequestParam Integer auteurId
    ) {
        return ResponseEntity.ok(
                service.getAmortissementsAnnuel(exerciceId, auteurId)
        );
    }


//     @GetMapping("/compte-resultat/{exerciceId}")
//     public ResponseEntity<?> getCompteResultat(
//             @PathVariable Integer exerciceId,
//             @RequestParam Integer auteurId
//     ) {
//         return ResponseEntity.ok(
//             service.getCompteResultat(exerciceId, auteurId)
//         );
//     }


@GetMapping("/compte-resultat/{exerciceId}")
public ResponseEntity<?> getCompteResultat(
        @PathVariable Integer exerciceId,
        @RequestParam Integer auteurId
) {
    return ResponseEntity.ok(
            service.getCompteResultat(
                    exerciceId,
                    auteurId
            )
    );
}


}
