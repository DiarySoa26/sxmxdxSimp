package com.sxmxdx.backend.controller;

import com.sxmxdx.backend.dto.LoginRequest;
import com.sxmxdx.backend.dto.LoginResponse;
import com.sxmxdx.backend.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    public AuthController(
        AuthService authService
    ) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
        @RequestBody LoginRequest request
    ) {

        LoginResponse response =
            authService.login(
                request.getEmail(),
                request.getPassword()
            );

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        }

        if (
            "Ce compte est désactivé."
                .equals(response.getMessage())
        ) {
            return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(response);
        }

        if (
            "Email et mot de passe obligatoires."
                .equals(response.getMessage())
        ) {
            return ResponseEntity
                .badRequest()
                .body(response);
        }

        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(response);
    }
}