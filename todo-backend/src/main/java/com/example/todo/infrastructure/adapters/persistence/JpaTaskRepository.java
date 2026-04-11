package com.example.todo.infrastructure.adapters.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface JpaTaskRepository extends JpaRepository<TaskEntity, UUID> {
    
    // Spring Data comprend automatiquement que l'on veut filtrer par le champ userId
    List<TaskEntity> findByUserId(String userId);
}