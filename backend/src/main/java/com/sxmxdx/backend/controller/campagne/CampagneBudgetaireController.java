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
    public Object creerApresBudget(
            @RequestBody CampagneApresBudgetRequest r,
            @RequestParam Integer auteurId
    ) {
        return service.creerApresBudget(r, auteurId);
    }

    @PostMapping
    public Object creer(
            @RequestBody CampagneRequest r,
            @RequestParam Integer auteurId
    ) {
        return service.creer(r, auteurId);
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
            @RequestBody CampagneRequest r,
            @RequestParam Integer auteurId
    ) {
        return service.modifier(id, r, auteurId);
    }

    @PatchMapping("/{id}/jalons/{jalonId}")
    public Object modifierJalon(
            @PathVariable Long id,
            @PathVariable Long jalonId,
            @RequestBody JalonRequest r,
            @RequestParam Integer auteurId
    ) {
        return service.modifierJalon(id, jalonId, r, auteurId);
    }

    @PatchMapping("/{id}/jalons/{jalonId}/terminer")
    public Object terminerJalon(
            @PathVariable Long id,
            @PathVariable Long jalonId,
            @RequestParam Integer auteurId
    ) {
        return service.terminerJalon(id, jalonId, auteurId);
    }

    @PatchMapping("/{id}/valider")
    public Object valider(
            @PathVariable Long id,
            @RequestParam Integer auteurId
    ) {
        return service.validerCampagne(id, auteurId);
    }
}
