package com.sxmxdx.backend.controller.campagne;

import com.sxmxdx.backend.dto.campagne.*;
import com.sxmxdx.backend.service.campagne.CampagneBudgetaireService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/campagnes")
@CrossOrigin(origins = "http://localhost:3000")
public class CampagneBudgetaireController {

    private final CampagneBudgetaireService service;

    public CampagneBudgetaireController(CampagneBudgetaireService service) {
        this.service = service;
    }

    @PostMapping("/apres-generation")
    public Object creerApresBudget(@RequestBody CampagneApresBudgetRequest r) {
        return service.creerApresBudget(r);
    }

    @PostMapping
    public Object creer(@RequestBody CampagneRequest r) {
        return service.creer(r);
    }

    @GetMapping
    public Object lister() {
        return service.lister();
    }

    @GetMapping("/{id}")
    public Object details(@PathVariable Long id) {
        return service.details(id);
    }

    @PutMapping("/{id}")
    public Object modifier(
        @PathVariable Long id,
        @RequestBody CampagneRequest r
    ) {
        return service.modifier(id, r);
    }

    @PatchMapping("/{id}/jalons/{jalonId}")
    public Object modifierJalon(
        @PathVariable Long id,
        @PathVariable Long jalonId,
        @RequestBody JalonRequest r
    ) {
        return service.modifierJalon(id, jalonId, r);
    }

    @PatchMapping("/{id}/jalons/{jalonId}/terminer")
    public Object terminerJalon(
        @PathVariable Long id,
        @PathVariable Long jalonId
    ) {
        return service.terminerJalon(id, jalonId);
    }

    @PatchMapping("/{id}/valider")
    public Object valider(@PathVariable Long id) {
        return service.validerCampagne(id);
    }
}