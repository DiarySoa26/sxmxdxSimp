package com.sxmxdx.backend.controller.comparaison;

import com.sxmxdx.backend.dto.comparaison.ComparaisonHistoriqueDTO;
import com.sxmxdx.backend.service.comparaison.ComparaisonHistoriqueService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/comparaisons")
@CrossOrigin(origins = "http://localhost:3000")
public class ComparaisonHistoriqueController {
    private final ComparaisonHistoriqueService service;
    public ComparaisonHistoriqueController(ComparaisonHistoriqueService service) { this.service = service; }
    @GetMapping("/exercices")
    public List<Integer> exercices() { return service.anneesDisponibles(); }
    // @GetMapping("/historique")
    // public ComparaisonHistoriqueDTO historique(@RequestParam Integer annee1, @RequestParam Integer annee2) {
    //     return service.comparer(annee1, annee2);
    // }

    @GetMapping("/historique")
    public ComparaisonHistoriqueDTO comparer(
            @RequestParam Integer annee1,
            @RequestParam Integer annee2,
            @RequestParam Integer auteurId
    ) {
        return service.comparer(annee1, annee2, auteurId);
    }
}
