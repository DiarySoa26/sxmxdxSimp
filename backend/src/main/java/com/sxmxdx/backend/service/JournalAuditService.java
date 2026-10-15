
package com.sxmxdx.backend.service;

import com.sxmxdx.backend.entity.JournalAudit;
import com.sxmxdx.backend.repository.JournalAuditRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class JournalAuditService {

    private final JournalAuditRepository repository;

    public JournalAuditService(JournalAuditRepository repository) {
        this.repository = repository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void enregistrer(
        Integer auteurId,
        String action,
        String module,
        String description,
        String entiteType,
        String entiteId,
        String statut
    ) {
        JournalAudit journal = new JournalAudit();

        journal.setUtilisateurId(auteurId);
        journal.setAction(action);
        journal.setModule(module);
        journal.setDescription(description);
        journal.setEntiteType(entiteType);
        journal.setEntiteId(entiteId);
        journal.setStatut(statut);

        repository.save(journal);
    }
}
