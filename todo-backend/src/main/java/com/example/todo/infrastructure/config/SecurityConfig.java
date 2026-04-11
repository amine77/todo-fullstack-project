// C'est ici que l'on définit les routes publiques (login) et les routes protégées (tasks).
package com.example.todo.infrastructure.config;

import com.example.todo.infrastructure.security.JwtAuthenticationFilter;
import com.example.todo.infrastructure.security.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtService jwtService) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Désactivé car on utilise JWT
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // Route publique
                .anyRequest().authenticated()               // Tout le reste est protégé
            )
            .addFilterBefore(new JwtAuthenticationFilter(jwtService), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
// Résumé de cette étape :
// Stateless : L'application ne stocke pas de sessions (idéal pour le cloud).

// JWT : Le client porte sa propre preuve d'identité.

// Sécurité par filtre : On vérifie le jeton avant même d'atteindre nos contrôleurs.