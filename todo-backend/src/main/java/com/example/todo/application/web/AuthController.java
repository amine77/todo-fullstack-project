package com.example.todo.application.web;

import com.example.todo.infrastructure.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtService jwtService;

    public AuthController(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        // Dans un vrai projet, vérifiez le mot de passe ici avec BCrypt !
        
        String token = jwtService.generateToken(username);
        return ResponseEntity.ok(Map.of("token", token));
    }
}