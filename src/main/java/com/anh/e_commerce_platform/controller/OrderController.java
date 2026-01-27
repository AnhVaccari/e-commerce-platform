package com.anh.e_commerce_platform.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.anh.e_commerce_platform.dto.CreateOrderRequest;
import com.anh.e_commerce_platform.dto.OrderResponse;
import com.anh.e_commerce_platform.dto.OrderStatusUpdateRequest;
import com.anh.e_commerce_platform.entity.Order;
import com.anh.e_commerce_platform.entity.User;
import com.anh.e_commerce_platform.service.OrderService;
import com.anh.e_commerce_platform.service.UserService;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:4200")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    // GET /api/orders - Récupérer toutes les commandes
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    // GET /api/orders/{id} - Récupérer une commande par ID
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Optional<Order> order = orderService.getOrderById(id);

        if (order.isPresent()) {
            return ResponseEntity.ok(order.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // GET /api/orders/user/{userId} - Commandes d'un utilisateur
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUser(@PathVariable Long userId) {
        Optional<User> user = userService.getUserById(userId);

        if (user.isPresent()) {
            List<Order> orders = orderService.getOrdersByUser(user.get());
            return ResponseEntity.ok(orders);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /api/orders - Créer une nouvelle commande
    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        try {
            // Récupérer l'utilisateur connecté
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            Optional<User> userOpt = userService.getUserByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Utilisateur non trouvé");
            }

            OrderResponse response = orderService.createOrderFromRequest(request, userOpt.get());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // PUT /api/orders/{id}/status - Changer le statut d'une commande
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id,
            @RequestBody OrderStatusUpdateRequest request) {
        try {
            Order updatedOrder = orderService.updateOrderStatus(id, request.getStatus());
            return ResponseEntity.ok(updatedOrder);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
