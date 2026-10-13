
package com.sxmxdx.backend.repository;

import com.sxmxdx.backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByNomIgnoreCase(String nom);
}
