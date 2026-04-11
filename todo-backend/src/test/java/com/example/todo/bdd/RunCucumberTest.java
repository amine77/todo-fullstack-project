package com.example.todo.bdd;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

/**
 * Point d'entrée pour l'exécution des tests Cucumber avec JUnit 5.
 * Cette classe remplace l'ancien @RunWith(Cucumber.class) de JUnit 4.
 */
@Suite
@IncludeEngines("cucumber")
// Indique où se trouvent vos fichiers .feature dans src/test/resources
@SelectClasspathResource("features")
// Configuration des paramètres Cucumber
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "com.example.todo.bdd")
// Ajoute un rapport joli dans la console et un fichier JSON pour le debug
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "pretty, html:target/cucumber-report.html")
public class RunCucumberTest {
    // La classe doit rester vide. 
    // Elle sert uniquement de support aux annotations pour le moteur de test.
}