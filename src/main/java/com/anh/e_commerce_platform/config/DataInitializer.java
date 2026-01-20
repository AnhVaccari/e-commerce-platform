package com.anh.e_commerce_platform.config;

import com.anh.e_commerce_platform.entity.Product;
import com.anh.e_commerce_platform.entity.Category;
import com.anh.e_commerce_platform.repository.ProductRepository;
import com.anh.e_commerce_platform.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public DataInitializer(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Vérifier si des données existent déjà
        if (categoryRepository.count() > 0) {
            return; // Éviter les doublons
        }

        // Créer des catégories
        Category electronics = new Category();
        electronics.setName("Électronique");
        electronics.setDescription("Appareils et gadgets électroniques");
        categoryRepository.save(electronics);

        Category clothing = new Category();
        clothing.setName("Vêtements");
        clothing.setDescription("Mode et accessoires");
        categoryRepository.save(clothing);

        Category books = new Category();
        books.setName("Livres");
        books.setDescription("Livres et publications");
        categoryRepository.save(books);

        // Créer des produits
        Product laptop = new Product();
        laptop.setName("MacBook Pro M3");
        laptop.setDescription("Ordinateur portable haute performance");
        laptop.setPrice(new BigDecimal("1999.99"));
        laptop.setStock(15);
        laptop.setCategory(electronics);
        productRepository.save(laptop);

        Product smartphone = new Product();
        smartphone.setName("iPhone 15");
        smartphone.setDescription("Smartphone dernière génération");
        smartphone.setPrice(new BigDecimal("899.99"));
        smartphone.setStock(8);
        smartphone.setCategory(electronics);
        productRepository.save(smartphone);

        Product tshirt = new Product();
        tshirt.setName("T-Shirt Angular");
        tshirt.setDescription("T-shirt dev Angular premium");
        tshirt.setPrice(new BigDecimal("25.99"));
        tshirt.setStock(0);
        tshirt.setCategory(clothing);
        productRepository.save(tshirt);

        Product javaBook = new Product();
        javaBook.setName("Effective Java");
        javaBook.setDescription("Guide des meilleures pratiques Java");
        javaBook.setPrice(new BigDecimal("45.99"));
        javaBook.setStock(3);
        javaBook.setCategory(books);
        productRepository.save(javaBook);

        System.out.println("✅ Données de test créées : " + productRepository.count() + " produits");
    }
}
