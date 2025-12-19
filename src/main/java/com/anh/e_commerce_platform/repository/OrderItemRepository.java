package com.anh.e_commerce_platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anh.e_commerce_platform.entity.Order;
import com.anh.e_commerce_platform.entity.OrderItem;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Lignes d'une commande
    List<OrderItem> findByOrder(Order order);
}
