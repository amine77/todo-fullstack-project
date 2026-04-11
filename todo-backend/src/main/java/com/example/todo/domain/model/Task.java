package com.example.todo.domain.model;

import java.util.UUID;

/**
 * Entité Task : Utilisation d'un record Java 21 pour l'immutabilité.
 * Le métier définit ce qu'est une tâche, sans se soucier de la base de données.
 */
public record Task(UUID id, String title, boolean completed, String userId) {
    
    // Validation métier lors de la création
    public Task {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Le titre de la tâche ne peut pas être vide");
        }
    }

    // Méthode métier pour marquer comme terminée
    public Task complete() {
        return new Task(this.id, this.title, true, this.userId);
    }
}