package com.example.todo.application.web;

import com.example.todo.domain.model.Task;
import com.example.todo.domain.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000") // Pour le futur Front-end React
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody String title) {
        // On récupère l'ID utilisateur injecté par notre JwtFilter
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        
        Task newTask = taskService.createNewTask(title, userId);
        return ResponseEntity.ok(newTask);
    }

    @GetMapping
    public ResponseEntity<List<Task>> getMyTasks() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        // Ici on appellerait une méthode du service pour lister les tâches
        return ResponseEntity.ok(taskService.getTasksForUser(userId));
    }
}