package com.anh.e_commerce_platform.service;

import com.anh.e_commerce_platform.dto.CreateOrderRequest;
import com.anh.e_commerce_platform.dto.OrderItemRequest;
import com.anh.e_commerce_platform.dto.OrderResponse;
import com.anh.e_commerce_platform.dto.OrderResponse.OrderItemResponse;
import com.anh.e_commerce_platform.entity.Order;
import com.anh.e_commerce_platform.entity.OrderItem;
import com.anh.e_commerce_platform.entity.OrderStatus;
import com.anh.e_commerce_platform.entity.Product;
import com.anh.e_commerce_platform.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.anh.e_commerce_platform.repository.OrderRepository;
import com.anh.e_commerce_platform.repository.OrderItemRepository;
import com.anh.e_commerce_platform.repository.ProductRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private UserService userService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    // Créer une commande avec validation du stock
    @Transactional
    public OrderResponse createOrderFromRequest(CreateOrderRequest request, User user) {
        // Créer la commande
        Order order = new Order();
        order.setUser(user);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        List<OrderItemResponse> itemResponses = new ArrayList<>();

        // Valider et traiter chaque item
        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Produit introuvable avec l'ID " + itemRequest.getProductId()));

            // Vérifier le stock
            if (product.getStock() < itemRequest.getQuantity()) {
                throw new IllegalArgumentException(
                        "Stock insuffisant pour " + product.getName() +
                                ". Disponible: " + product.getStock() +
                                ", Demandé: " + itemRequest.getQuantity());
            }

            // Réduire le stock
            product.setStock(product.getStock() - itemRequest.getQuantity());
            productRepository.save(product);

            // Créer l'item de commande
            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItems.add(orderItem);

            // Calculer le sous-total
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(subtotal);

            // Préparer la réponse
            itemResponses.add(new OrderItemResponse(
                    product.getId(),
                    product.getName(),
                    itemRequest.getQuantity(),
                    product.getPrice()));
        }

        // Sauvegarder la commande
        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        // Sauvegarder les items avec référence à la commande
        for (OrderItem item : orderItems) {
            item.setOrder(savedOrder);
            orderItemRepository.save(item);
        }

        return new OrderResponse(savedOrder, itemResponses);
    }

    // Créer une commande (ancienne méthode pour compatibilité)
    public Order createOrder(Order order) {
        // Vérifier que l'utilisateur existe vraiment
        if (order.getUser() != null && order.getUser().getId() != null) {
            Optional<User> existingUser = userService.getUserById(order.getUser().getId());
            if (existingUser.isPresent()) {
                order.setUser(existingUser.get());
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
