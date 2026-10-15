
package com.sxmxdx.backend.repository;

import com.sxmxdx.backend.entity.ViewJournalAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ViewJournalAuditRepository
        extends JpaRepository<ViewJournalAudit, Long> {

    List<ViewJournalAudit> findAllByOrderByDateActionDesc();
}
