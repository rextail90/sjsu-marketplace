package com.sjsu.marketplace.sjsu_marketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.sjsu.marketplace.sjsu_marketplace") // Forces scanning
public class SjsuMarketplaceApplication {
    public static void main(String[] args) {
        SpringApplication.run(SjsuMarketplaceApplication.class, args);
    }
}

