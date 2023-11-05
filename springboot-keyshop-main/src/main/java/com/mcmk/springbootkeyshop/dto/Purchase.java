package com.mcmk.springbootkeyshop.dto;

import com.mcmk.springbootkeyshop.entity.Address;
import com.mcmk.springbootkeyshop.entity.Customer;
import com.mcmk.springbootkeyshop.entity.Order;
import com.mcmk.springbootkeyshop.entity.OrderItem;
import lombok.Data;

import java.util.Set;

@Data
public class Purchase {
    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;
}
