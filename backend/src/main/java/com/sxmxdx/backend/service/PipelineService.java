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
            @Value("${pipeline.api.url}") String pipelineApiUrl
    ) {

        this.restClient = RestClient.builder()
                .baseUrl(pipelineApiUrl)
                .build();
    }

    public Map<?, ?> importerExercice(
            String fileName
    ) {

        String filePath =
                "/app/data/" + fileName;

        Map<String, String> request = Map.of(
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
}