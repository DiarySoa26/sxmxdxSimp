
package com.sxmxdx.backend.controller;

import com.sxmxdx.backend.entity.ViewJournalConnexion;
import com.sxmxdx.backend.service.JournalConnexionService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tracabilite")
@CrossOrigin(origins = "http://localhost:3000")
public class JournalConnexionController {

    private final JournalConnexionService service;

    public JournalConnexionController(
        JournalConnexionService service
    ) {
        this.service = service;
    }

    @GetMapping("/connexions")
    public List<ViewJournalConnexion> connexions() {
        return service.lister();
    }
}
