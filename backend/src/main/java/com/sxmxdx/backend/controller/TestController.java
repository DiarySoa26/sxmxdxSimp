package com.sxmxdx.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/test")
    public Map<String, Object> test() {

        return Map.of(
            "success", true,
            "message", "Backend Spring Boot SXMXDX opérationnel"
        );

    }
}