package com.velocira.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
public class Role extends BaseEntity {

    // e.g. "CUSTOMER", "ADMIN" — kept as a free string column (not a Java enum)
    // so new roles can be added later (spec §6) without a schema migration.
    @Column(nullable = false, unique = true, length = 40)
    private String name;

    private String description;

    public Role(String name) {
        this.name = name;
    }
}
