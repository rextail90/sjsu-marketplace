package com.sjsu.marketplace.sjsu_marketplace.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
    
    @GetMapping("/")
    public String home() {
        return "SJSU Marketplace API is running!";
    }
} 