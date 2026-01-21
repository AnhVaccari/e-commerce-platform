package com.anh.e_commerce_platform.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anh.e_commerce_platform.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Recherche par email (connexion utilisateur)
    Optional<User> findByEmail(String email);

    // Vérifier si email existe déjà (register)
    boolean existsByEmail(String email);

}
