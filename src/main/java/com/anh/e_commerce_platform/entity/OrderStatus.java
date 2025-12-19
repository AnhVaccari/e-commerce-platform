package com.anh.e_commerce_platform.entity;

public enum OrderStatus {

    PENDING("En attente"),
    CONFIRMED("Confirmée"),
    SHIPPED("Expédiée"),
    DELIVERED("Livrée"),
    CANCELLED("Annulée");

    private final String displayName;

    OrderStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
