package com.anh.e_commerce_platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anh.e_commerce_platform.entity.Category;
import com.anh.e_commerce_platform.entity.Product;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Recherche par catégorie
    List<Product> findByCategory(Category category);

    // Recherche par nom (barre de recherche)
    List<Product> findByNameContainingIgnoreCase(String name);
}
