
package com.sxmxdx.backend.repository;

import com.sxmxdx.backend.entity.ViewJournalConnexion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ViewJournalConnexionRepository
        extends JpaRepository<ViewJournalConnexion, Integer> {

    List<ViewJournalConnexion> findAllByOrderByDateConnexionDesc();
}
