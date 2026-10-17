
package com.sxmxdx.backend.controller.comparaison;

import com.sxmxdx.backend.dto.comparaison.ComparaisonProspectiveDTO;
import com.sxmxdx.backend.service.comparaison.ComparaisonProspectiveService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @GetMapping("/budgets")
    public List<Integer> budgetsDisponibles() {
        return service.getBudgetsDisponibles();
    }

    @GetMapping("/previsions")
    public List<Integer> previsionsDisponibles() {
        return service.getPrevisionsDisponibles();
    }

    // @GetMapping
    // public ComparaisonProspectiveDTO comparer(
    //     @RequestParam Integer anneeBudget,
    //     @RequestParam Integer anneePrevision
    // ) {
    //     return service.comparer(
    //         anneeBudget,
    //         anneePrevision
    //     );
    // }

//     @GetMapping(produces = "text/plain")
// public String comparer(
//     @RequestParam Integer anneeBudget,
//     @RequestParam Integer anneePrevision
// ) {
//     return "Comparaison OK : " + anneeBudget + " / " + anneePrevision;
// }


// @GetMapping(produces = "application/json")
// public Map<String, Object> comparer(
//     @RequestParam Integer anneeBudget,
//     @RequestParam Integer anneePrevision
// ) {
//     return Map.of(
//         "anneeBudget", anneeBudget,
//         "anneePrevision", anneePrevision,
//         "message", "Comparaison fonctionnelle"
//     );
// }


@GetMapping(produces = "application/json")
public ComparaisonProspectiveDTO comparer(
    @RequestParam Integer anneeBudget,
    @RequestParam Integer anneePrevision
) {
    ComparaisonProspectiveDTO resultat =
        service.comparer(anneeBudget, anneePrevision);

    System.out.println("Comparaison calculée : " + resultat);

    return resultat;
}
}
