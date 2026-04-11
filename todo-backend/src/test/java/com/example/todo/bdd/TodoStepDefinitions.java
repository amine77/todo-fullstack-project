package com.example.todo.bdd;

import com.example.todo.domain.model.Task;
import com.example.todo.domain.service.TaskService;
import io.cucumber.java.fr.*;
import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

// Cette annotation permet à Cucumber de partager le contexte Spring
@CucumberContextConfiguration
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class TodoStepDefinitions {

    @Autowired
    private TaskService taskService; // Injection réelle du service

    private String currentUser;
    private Task lastCreatedTask;

    @Etantdonné("que je suis un utilisateur connecté {string}")
    public void que_je_suis_un_utilisateur_connecté(String email) {
        this.currentUser = email;
    }

    @Quand("je crée une tâche avec le titre {string}")
    public void je_crée_une_tâche_avec_le_titre(String titre) {
        // Appelle la vraie logique métier
        this.lastCreatedTask = taskService.createNewTask(titre, currentUser);
    }

    @Alors("la tâche doit être enregistrée et marquée comme non terminée")
    public void la_tâche_doit_être_enregistrée_et_marquée_comme_non_terminée() {
        assertNotNull(lastCreatedTask);
        assertNotNull(lastCreatedTask.id());
        assertEquals(currentUser, lastCreatedTask.userId());
        assertFalse(lastCreatedTask.completed());
    }
}