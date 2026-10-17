
package com.sxmxdx.backend.controller.comparaison;

import com.sxmxdx.backend.dto.comparaison.EvaluationPredictionDTO;
import com.sxmxdx.backend.service.comparaison.EvaluationPredictionService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comparaisons/evaluation")
@CrossOrigin(origins = "http://localhost:3000")
public class EvaluationPredictionController {

    private final EvaluationPredictionService service;

    public EvaluationPredictionController(
            EvaluationPredictionService service
    ) {
        this.service = service;
    }

    @GetMapping("/exercices")
    public List<Integer> exercices() {
        return service.exercicesDisponibles();
    }

    @GetMapping
    public EvaluationPredictionDTO evaluer(
            @RequestParam Integer annee
    ) {
        return service.evaluer(annee);
    }
}
