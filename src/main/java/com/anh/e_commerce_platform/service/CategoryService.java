package com.anh.e_commerce_platform.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.anh.e_commerce_platform.entity.Category;
import com.anh.e_commerce_platform.repository.CategoryRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // Créer une catégorie
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    // Récupérer toutes les catégories
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Récupérer une catégorie par ID
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    // Supprimer une catégorie
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
