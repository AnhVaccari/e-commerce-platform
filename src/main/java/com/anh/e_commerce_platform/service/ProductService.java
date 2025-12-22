package com.anh.e_commerce_platform.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.anh.e_commerce_platform.entity.Category;
import com.anh.e_commerce_platform.entity.Product;
import com.anh.e_commerce_platform.repository.ProductRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // Créer un produit
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    // Récupérer tous les produits
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Récupérer un produit par ID
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    // Récupérer produits par catégorie
    public List<Product> getProductsByCategory(Category category) {
        return productRepository.findByCategory(category);
    }

    // Rechercher produits par nom
    public List<Product> searchProductsByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    // Supprimer un produit
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
