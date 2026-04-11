package com.example.todo.domain.service;

import com.example.todo.domain.model.Task;
import com.example.todo.domain.ports.TaskRepository;
import java.util.List;
import java.util.UUID;

public class TaskService {
    
    private final TaskRepository taskRepository;

    // Pas d'annotation @Autowired ici, l'injection se fait par le constructeur
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public Task createNewTask(String title, String userId) {
        Task newTask = new Task(UUID.randomUUID(), title, false, userId);
        return taskRepository.save(newTask);
    }

    public List<Task> getTasksForUser(String userId) {
        return taskRepository.findAllByUserId(userId);
    }
}