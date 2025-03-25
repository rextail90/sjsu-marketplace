package com.sjsu.marketplace.sjsu_marketplace.controller;

import com.sjsu.marketplace.sjsu_marketplace.model.Listing;
import com.sjsu.marketplace.sjsu_marketplace.model.ListingStatus;
import com.sjsu.marketplace.sjsu_marketplace.model.User;
import com.sjsu.marketplace.sjsu_marketplace.service.ListingService;
import com.sjsu.marketplace.sjsu_marketplace.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    @Autowired
    private ListingService listingService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Listing> createListing(
            @Valid @RequestPart("listing") Listing listing,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            Authentication authentication) throws IOException {
        User seller = userService.getUserByUsername(authentication.getName());
        return ResponseEntity.ok(listingService.createListing(listing, seller, images));
    }

    @GetMapping
    public ResponseEntity<Page<Listing>> getAllListings(Pageable pageable) {
        return ResponseEntity.ok(listingService.getAllListings(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Listing>> searchListings(
            @RequestParam String keyword,
            Pageable pageable) {
        return ResponseEntity.ok(listingService.searchListings(keyword, pageable));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<Page<Listing>> getListingsByCategory(
            @PathVariable String category,
            Pageable pageable) {
        return ResponseEntity.ok(listingService.getListingsByCategory(category, pageable));
    }

    @GetMapping("/price-range")
    public ResponseEntity<Page<Listing>> getListingsByPriceRange(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice,
            Pageable pageable) {
        return ResponseEntity.ok(listingService.getListingsByPriceRange(minPrice, maxPrice, pageable));
    }

    @GetMapping("/user")
    public ResponseEntity<Page<Listing>> getUserListings(
            Authentication authentication,
            Pageable pageable) {
        User user = userService.getUserByUsername(authentication.getName());
        return ResponseEntity.ok(listingService.getUserListings(user, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Listing> getListing(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.getListing(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Listing> updateListingStatus(
            @PathVariable Long id,
            @RequestParam ListingStatus status) {
        return ResponseEntity.ok(listingService.updateListingStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable Long id) {
        listingService.deleteListing(id);
        return ResponseEntity.ok().build();
    }
} 