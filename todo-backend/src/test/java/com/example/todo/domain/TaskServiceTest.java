package com.example.todo.domain;

import com.example.todo.domain.model.Task;
import com.example.todo.domain.ports.TaskRepository;
import com.example.todo.domain.service.TaskService;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;


class TaskServiceTest {

    @Test
    void should_create_task_with_valid_data() {
        // GIVEN
        TaskRepository repository = mock(TaskRepository.class);
        TaskService service = new TaskService(repository);
        String title = "Finir le projet Fullstack";
        
        // WHEN
        service.createNewTask(title, "user-1");

        // THEN
        verify(repository, times(1)).save(any(Task.class));
    }
}