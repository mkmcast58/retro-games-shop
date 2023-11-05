package com.mcmk.springbootkeyshop.dao;

import com.mcmk.springbootkeyshop.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.web.bind.annotation.CrossOrigin;


public interface CustomerRepository extends JpaRepository<Customer, Long> {

    //SELECT * FROM Customer c WHERE c.email = theEmail
    Customer findByEmail(String theEmail);
}
