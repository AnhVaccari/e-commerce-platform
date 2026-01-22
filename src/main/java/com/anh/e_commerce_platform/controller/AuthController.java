package com.anh.e_commerce_platform.controller;

import com.anh.e_commerce_platform.dto.LoginRequest;
import com.anh.e_commerce_platform.dto.LoginResponse;
import com.anh.e_commerce_platform.dto.RegisterRequest;
import com.anh.e_commerce_platform.entity.User;
import com.anh.e_commerce_platform.security.JwtTokenUtil;
import com.anh.e_commerce_platform.security.UserPrincipal;
import com.anh.e_commerce_platform.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            // Vérifier si l'email existe déjà
            if (userService.emailExists(registerRequest.getEmail())) {
                return ResponseEntity.badRequest()
                        .body("Erreur: L'email est déjà utilisé !");
            }

            // Créer un nouvel utilisateur
            User user = new User();
            user.setFirstName(registerRequest.getFirstName());
            user.setLastName(registerRequest.getLastName());
            user.setEmail(registerRequest.getEmail());
            user.setPassword(registerRequest.getPassword()); // Sera hashé dans UserService
            user.setPhone(registerRequest.getPhone());
            user.setAddress(registerRequest.getAddress());

            User savedUser = userService.createUser(user);

            return ResponseEntity.ok("Utilisateur créé avec succès !");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Erreur lors de la création de l'utilisateur: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Authentifier l'utilisateur
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()));

            // Récupérer les détails de l'utilisateur authentifié
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            // Générer le token JWT
            String token = jwtTokenUtil.generateToken(userPrincipal);

            // Créer la réponse
            LoginResponse loginResponse = new LoginResponse(
                    token,
                    userPrincipal.getUser().getEmail(),
                    userPrincipal.getUser().getFirstName(),
                    userPrincipal.getUser().getLastName(),
                    userPrincipal.getUser().getRole().name());

            return ResponseEntity.ok(loginResponse);

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Email ou mot de passe incorrect");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Erreur lors de la connexion: " + e.getMessage());
        }
    }
}
