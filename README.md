🚀 Commandes pour lancer le projet
Pour que votre projet "brille", ajoutez ces commandes dans votre README.md :

Lancer les tests (Qualité) :
mvn test (Ceci lancera à la fois JUnit et Cucumber).

Lancer toute l'infrastructure (Docker) :
docker-compose up --build

Tester l'API (Postman/Curl) :

POST /api/auth/login pour récupérer le token.

GET /api/tasks avec le header Authorization: Bearer <token>.