// package com.sxmxdx.backend.service;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.http.MediaType;
// import org.springframework.stereotype.Service;
// import org.springframework.web.client.RestClient;

// import java.util.Map;

// @Service
// public class PipelineService {

//     private final RestClient restClient;

//     public PipelineService(
//             @Value("${pipeline.api.url}")
//             String pipelineApiUrl
//     ) {

//         System.out.println(
//                 "[PIPELINE] URL Flask : "
//                         + pipelineApiUrl
//         );

//         this.restClient =
//                 RestClient.builder()
//                         .baseUrl(pipelineApiUrl)
//                         .build();
//     }


//     public Map<?, ?> importerExercice(
//             String fileName
//     ) {

//         String filePath =
//                 "/app/data/" + fileName;

//         System.out.println(
//                 "[PIPELINE] Fichier envoyé à Flask : "
//                         + filePath
//         );

//         Map<String, String> request =
//                 Map.of(
//                         "filePath",
//                         filePath
//                 );

//         return restClient
//                 .post()
//                 .uri("/import")
//                 .contentType(
//                         MediaType.APPLICATION_JSON
//                 )
//                 .body(request)
//                 .retrieve()
//                 .body(Map.class);
//     }
// }



package com.sxmxdx.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class PipelineService {

    private final RestClient restClient;

    public PipelineService(
            @Value("${pipeline.api.url}")
            String pipelineApiUrl
    ) {

        System.out.println(
                "[PIPELINE] URL Flask : "
                        + pipelineApiUrl
        );

        this.restClient =
                RestClient.builder()
                        .baseUrl(pipelineApiUrl)
                        .build();
    }

    public Map<?, ?> importerExercice(String fileName) {
        String filePath = "/app/data/" + fileName;
        System.out.println("[PIPELINE] Fichier envoyé à Flask : " + filePath);
        Map<String, String> request =
                Map.of(
                        "filePath",
                        filePath
                );

        return restClient
                .post()
                .uri("/import")
                .contentType(
                        MediaType.APPLICATION_JSON
                )
                .body(request)
                .retrieve()
                .body(Map.class);
    }

    public Map<?, ?> genererBudget() {

        System.out.println("[PIPELINE] Demande de génération du budget...");

        Map<?, ?> resultat =
                restClient
                        .post()
                        .uri("/api/budgets/generer")
                        .retrieve()
                        .body(Map.class);

        if (resultat == null) {
            throw new RuntimeException(
                    "Aucune réponse du pipeline Flask."
            );
        }

        System.out.println(
                "[PIPELINE] Réponse génération budget : "
                        + resultat
        );

        return resultat;
    }


    public Map<?, ?> genererPrediction() {

        System.out.println(
                "[PIPELINE] Demande de génération de la prédiction..."
        );

        Map<?, ?> resultat =
                restClient
                        .post()
                        .uri("/api/predictions/generer")
                        .retrieve()
                        .body(Map.class);

        if (resultat == null) {
                throw new RuntimeException(
                        "Aucune réponse du pipeline de prédiction."
                );
        }

        System.out.println(
                "[PIPELINE] Réponse prédiction reçue."
        );

        return resultat;
        }


    
}