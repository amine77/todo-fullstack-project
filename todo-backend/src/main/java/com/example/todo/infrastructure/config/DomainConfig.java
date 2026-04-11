package com.example.todo.infrastructure.config;

import com.example.todo.domain.ports.TaskRepository;
import com.example.todo.domain.service.TaskService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DomainConfig {

    /**
     * On crée le Bean TaskService manuellement.
     * Spring injecte automatiquement l'implémentation de TaskRepository 
     * (qui est PostgresTaskRepository) car elle est annotée @Component.
     */
    @Bean
    public TaskService taskService(TaskRepository taskRepository) {
        return new TaskService(taskRepository);
    }
}
// C'est ici que nous définissons les beans du domaine.
// Comme notre TaskService est dans le Domaine et n'a pas d'annotations @Service (pour rester pur), nous devons le déclarer manuellement dans l'infrastructure.