
package com.sxmxdx.backend.controller;

import com.sxmxdx.backend.entity.JournalAudit;
import com.sxmxdx.backend.entity.ViewJournalAudit;
import com.sxmxdx.backend.repository.JournalAuditRepository;
import com.sxmxdx.backend.repository.ViewJournalAuditRepository;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tracabilite")
@CrossOrigin(origins = "http://localhost:3000")
public class JournalAuditController {

    private final ViewJournalAuditRepository repository;

    public JournalAuditController(ViewJournalAuditRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/actions")
    public List<ViewJournalAudit> actions() {
        return repository.findAllByOrderByDateActionDesc();
    }
}
