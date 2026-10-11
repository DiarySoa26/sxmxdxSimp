package com.sxmxdx.backend.repository.campagne;

import com.sxmxdx.backend.entity.campagne.CampagneBudgetaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CampagneBudgetaireRepository
        extends JpaRepository<CampagneBudgetaire, Long> {

    List<CampagneBudgetaire> findAllByOrderByDateDebutDesc();
}