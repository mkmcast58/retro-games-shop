package com.mcmk.springbootkeyshop.service;

import com.mcmk.springbootkeyshop.dto.PaymentInfo;
import com.mcmk.springbootkeyshop.dto.Purchase;
import com.mcmk.springbootkeyshop.dto.PurchaseResponse;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

public interface CheckoutService {
    PurchaseResponse placeOrder(Purchase purchase);

    PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException;
}
