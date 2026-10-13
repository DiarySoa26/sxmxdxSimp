
package com.sxmxdx.backend.controller;

import com.sxmxdx.backend.dto.UtilisateurRequest;
import com.sxmxdx.backend.dto.UtilisateurModificationRequest;
import com.sxmxdx.backend.service.UtilisateurService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/utilisateurs")
@CrossOrigin(origins = "http://localhost:3000")
public class UtilisateurController {

    private final UtilisateurService service;

    public UtilisateurController(UtilisateurService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> lister() {
        return service.lister();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> creer(
        @RequestBody UtilisateurRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(service.creer(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> modifier(
        @PathVariable Integer id,
        @RequestBody UtilisateurModificationRequest request
    ) {
        return ResponseEntity.ok(service.modifier(id, request));
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<Map<String, Object>> changerStatut(
        @PathVariable Integer id,
        @RequestBody Map<String, Boolean> request
    ) {
        if (request == null || request.get("actif") == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(
            service.changerStatut(id, request.get("actif"))
        );
    }
}
