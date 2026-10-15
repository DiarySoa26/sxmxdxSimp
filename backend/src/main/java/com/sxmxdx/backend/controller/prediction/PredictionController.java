// package com.sxmxdx.backend.controller.prediction;

// import com.sxmxdx.backend.service.prediction.PredictionService;

// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.Map;

// @RestController
// @RequestMapping("/api/predictions")
// @CrossOrigin(origins = "http://localhost:3000")
// public class PredictionController {

//     private final PredictionService predictionService;

//     public PredictionController(
//             PredictionService predictionService
//     ) {
//         this.predictionService = predictionService;
//     }

//     @PostMapping("/generer")
//     public ResponseEntity<Map<?, ?>> genererPrediction() {

//         System.out.println(
//                 "[PREDICTION] Demande de génération reçue."
//         );

//         return ResponseEntity.ok(
//                 predictionService.genererPrediction()
//         );
//     }
// }






package com.sxmxdx.backend.controller.prediction;

import com.sxmxdx.backend.service.prediction.PredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/predictions")
@CrossOrigin(origins = "http://localhost:3000")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(
            PredictionService predictionService
    ) {
        this.predictionService = predictionService;
    }

    @PostMapping("/generer")
    public Map<?, ?> genererPrediction(
            @RequestParam Integer auteurId
    ) {
        return predictionService.genererPrediction(auteurId);
    }

    @GetMapping("/last")
    public ResponseEntity<?> lastPrediction() {
        Map<String, Object> prediction =
                predictionService.lastPrediction();

        if (prediction == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(prediction);
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listerPredictions() {
        return ResponseEntity.ok(predictionService.listerPredictions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> rechercherPrediction(@PathVariable Long id) {
        Map<String, Object> prediction = predictionService.rechercherPrediction(id);
        if (prediction == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(prediction);
}
}