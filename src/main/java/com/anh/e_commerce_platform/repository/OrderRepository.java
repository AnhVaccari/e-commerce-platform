package com.anh.e_commerce_platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anh.e_commerce_platform.entity.Order;
import com.anh.e_commerce_platform.entity.OrderStatus;
import com.anh.e_commerce_platform.entity.User;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Commandes d'un utilisateur
    List<Order> findByUser(User user);

    // Commandes par statut
    List<Order> findByStatus(OrderStatus status);

    // Commandes d'un utilisateur par statut
    List<Order> findByUserAndStatus(User user, OrderStatus status);
}
