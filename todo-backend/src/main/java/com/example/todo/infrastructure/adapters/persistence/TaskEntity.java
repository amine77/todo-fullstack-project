// Nous devons mapper notre record Task du domaine vers une @Entity JPA. 
// Cela permet de garder le domaine propre (sans annotations Hibernate).
package com.example.todo.infrastructure.adapters.persistence;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "tasks")
public class TaskEntity {
    @Id
    private UUID id;
    private String title;
    private boolean completed;
    private String userId;

    // Constructeurs, Getters, Setters...
    public TaskEntity() {}

    // Méthode de conversion (Mappers)
    public static TaskEntity fromDomain(com.example.todo.domain.model.Task task) {
        TaskEntity entity = new TaskEntity();
        entity.id = task.id();
        entity.title = task.title();
        entity.completed = task.completed();
        entity.userId = task.userId();
        return entity;
    }

    public com.example.todo.domain.model.Task toDomain() {
        return new com.example.todo.domain.model.Task(id, title, completed, userId);
    }
}