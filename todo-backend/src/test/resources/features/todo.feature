# language: fr
Fonctionnalité: Gestion des tâches
  En tant qu'utilisateur authentifié
  Je veux pouvoir créer une tâche
  Afin de ne pas oublier ce que j'ai à faire

  Scénario: Création réussie d'une tâche
    Etant donné que je suis un utilisateur connecté "jean@email.com"
    Quand je crée une tâche avec le titre "Apprendre l'architecture hexagonale"
    Alors la tâche doit être enregistrée et marquée comme non terminée