
package com.sxmxdx.backend.repository;

import com.sxmxdx.backend.entity.JournalAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JournalAuditRepository
        extends JpaRepository<JournalAudit, Long> {

    List<JournalAudit> findAllByOrderByDateActionDesc();
}
