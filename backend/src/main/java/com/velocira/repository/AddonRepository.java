package com.velocira.repository;

import com.velocira.entity.Addon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AddonRepository extends JpaRepository<Addon, UUID> {
    List<Addon> findAllByActiveTrue();
    List<Addon> findAllByIdInAndActiveTrue(List<UUID> ids);
}
