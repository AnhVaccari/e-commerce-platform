package com.anh.e_commerce_platform.service;

import com.anh.e_commerce_platform.entity.Order;
import com.anh.e_commerce_platform.entity.OrderStatus;
import com.anh.e_commerce_platform.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.anh.e_commerce_platform.repository.OrderRepository;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private UserService userService;

    @Autowired
    private OrderRepository orderRepository;

    // Créer une commande
    public Order createOrder(Order order) {
        // TODO: Ajouter server-side validation pour la sécurité
        // On fait confiance front-end calculation de prix pour l'instant

        // Vérifier que l'utilisateur existe vraiment
        if (order.getUser() != null && order.getUser().getId() != null) {
            Optional<User> existingUser = userService.getUserById(order.getUser().getId());
            if (existingUser.isPresent()) {
                order.setUser(existingUser.get()); // Utiliser l'utilisateur complet
            } else {
                throw new IllegalArgumentException("Utilisateur introuvable avec l'ID " + order.getUser().getId());
            }
        }

        return orderRepository.save(order);
    }

    // Récupérer toutes les commandes
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Récupérer une commande par ID
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    // Récupérer commandes d'un utilisateur
    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUser(user);
    }

    // Changer le statut d'une commande
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Optional<Order> optionalOrder = orderRepository.findById(orderId);

        if (optionalOrder.isPresent()) {
            Order order = optionalOrder.get();
            order.setStatus(newStatus);
            return orderRepository.save(order);
        } else {
            throw new IllegalArgumentException("Commande avec l'ID " + orderId + " introuvable !");
        }
    }
}
