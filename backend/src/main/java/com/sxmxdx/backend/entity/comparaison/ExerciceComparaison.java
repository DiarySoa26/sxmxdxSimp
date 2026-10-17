// package com.sxmxdx.backend.entity.comparaison;

// import jakarta.persistence.*;
// import org.hibernate.annotations.Immutable;

// @Entity
// @Immutable
// @Table(name = "exercice")
// public class ExerciceComparaison {
//     @Id @Column(name = "id") private Long id;
//     @Column(name = "annee") private Integer annee;
//     public Long getId(){return id;}
//     public Integer getAnnee(){return annee;}
// }




package com.sxmxdx.backend.entity.comparaison;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

@Entity
@Immutable
@Table(name = "exercice")
public class ExerciceComparaison {

    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "annee")
    private Integer annee;

    public Integer getId() {
        return id;
    }

    public Integer getAnnee() {
        return annee;
    }
}
