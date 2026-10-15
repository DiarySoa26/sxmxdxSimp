
package com.sxmxdx.backend.service;

import com.sxmxdx.backend.entity.ViewJournalConnexion;
import com.sxmxdx.backend.repository.ViewJournalConnexionRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class JournalConnexionService {

    private final ViewJournalConnexionRepository repository;

    public JournalConnexionService(
        ViewJournalConnexionRepository repository
    ) {
        this.repository = repository;
    }

    public List<ViewJournalConnexion> lister() {
        return repository.findAllByOrderByDateConnexionDesc();
    }
}
