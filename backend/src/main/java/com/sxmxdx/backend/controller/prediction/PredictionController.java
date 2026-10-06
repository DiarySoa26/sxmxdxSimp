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
    public ResponseEntity<Map<?, ?>> genererPrediction() {
        System.out.println(
                "[PREDICTION] Demande de génération reçue."
        );

        return ResponseEntity.ok(
                predictionService.genererPrediction()
        );
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
}