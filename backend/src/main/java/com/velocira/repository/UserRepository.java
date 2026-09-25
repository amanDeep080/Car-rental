package com.velocira.repository;

import com.velocira.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByPhone(String phone);
    long countByCreatedAtGreaterThanEqual(java.time.Instant since);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE User u SET u.lastSeenAt = :now WHERE u.id = :userId")
    void updateLastSeen(@org.springframework.data.repository.query.Param("userId") UUID userId, @org.springframework.data.repository.query.Param("now") java.time.Instant now);
}
