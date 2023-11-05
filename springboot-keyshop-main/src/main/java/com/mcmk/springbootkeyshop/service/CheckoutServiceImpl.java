package com.mcmk.springbootkeyshop.service;

import com.mcmk.springbootkeyshop.dao.CustomerRepository;
import com.mcmk.springbootkeyshop.dto.PaymentInfo;
import com.mcmk.springbootkeyshop.dto.Purchase;
import com.mcmk.springbootkeyshop.dto.PurchaseResponse;
import com.mcmk.springbootkeyshop.entity.Customer;
import com.mcmk.springbootkeyshop.entity.Order;
import com.mcmk.springbootkeyshop.entity.OrderItem;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CheckoutServiceImpl implements CheckoutService{

    private CustomerRepository customerRepository;

    public CheckoutServiceImpl(CustomerRepository customerRepository, @Value("${stripe.key.secret}") String secretKey){
        this.customerRepository = customerRepository;
        Stripe.apiKey = secretKey;
    }
    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {

        //pobieranie zamowienia z dto
        Order order= purchase.getOrder();

        //generowanie numreu
        String orderTrackingNumber = generateOrderTrackingNUmber();
        order.setOrderTrackingNumber(orderTrackingNumber);

        //populate order with orderItems
        Set<OrderItem> orderItems = purchase.getOrderItems();
        orderItems.forEach(item-> order.add(item));

        //pop with billing & shipping adfresses
        order.setBillingAddress(purchase.getBillingAddress());
        order.setShippingAddress(purchase.getBillingAddress());

        //pop customer with order
        Customer customer = purchase.getCustomer();
        String theEmail = customer.getEmail();
        Customer customerFromDB = customerRepository.findByEmail(theEmail);
        if (customerFromDB!=null){
            customer = customerFromDB;
        }

        customer.add(order);

        //save to the database
        customerRepository.save(customer);

        //return response
        return new PurchaseResponse(orderTrackingNumber);
    }

    @Override
    public PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException {

        List<String> paymentMethodTypes = new ArrayList<>();
        paymentMethodTypes.add("card");

        Map<String, Object> params = new HashMap<>();
        params.put("amount", paymentInfo.getAmount());
        params.put("currency", paymentInfo.getCurrency());
        params.put("payment_method_types", paymentMethodTypes);
        //parametr for description in stripe credit card payment dashboard
        params.put("description", "Retro keyshop purchase");
        params.put("receipt_email", paymentInfo.getReceiptEmail());

        return PaymentIntent.create(params);
    }

    private String generateOrderTrackingNUmber() {
        //UUID 4 -random id
        return UUID.randomUUID().toString();
    }
}
