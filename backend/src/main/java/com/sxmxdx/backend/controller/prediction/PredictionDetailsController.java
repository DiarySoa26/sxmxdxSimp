package com.sxmxdx.backend.controller.prediction;

import com.sxmxdx.backend.service.prediction.PredictionDetailsService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/predictions/details")
@CrossOrigin(origins = "http://localhost:3000")
public class PredictionDetailsController {

    private final PredictionDetailsService service;

    public PredictionDetailsController(
        PredictionDetailsService service
    ) {
        this.service = service;
    }

    @GetMapping("/{annee}/amortissements")
    public Map<String, Object> amortissements(
        @PathVariable Integer annee
    ) {
        return service.getAmortissements(annee);
    }

    @GetMapping("/{annee}/charges-categories")
    public Map<String, Object> chargesCategories(
        @PathVariable Integer annee
    ) {
        return service.getChargesCategories(annee);
    }
}
