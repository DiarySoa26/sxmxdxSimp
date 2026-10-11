package com.sxmxdx.backend.repository.campagne;

import com.sxmxdx.backend.entity.campagne.JalonBudgetaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface JalonBudgetaireRepository
        extends JpaRepository<JalonBudgetaire, Long> {

    List<JalonBudgetaire> findByCampagneIdOrderByOrdreAsc(Long campagneId);

    Optional<JalonBudgetaire> findByCampagneIdAndCode(
        Long campagneId, String code
    );
}