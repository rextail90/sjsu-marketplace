package com.sjsu.marketplace.sjsu_marketplace.service;

import com.sjsu.marketplace.sjsu_marketplace.model.Listing;
import com.sjsu.marketplace.sjsu_marketplace.model.ListingImage;
import com.sjsu.marketplace.sjsu_marketplace.model.ListingStatus;
import com.sjsu.marketplace.sjsu_marketplace.model.User;
import com.sjsu.marketplace.sjsu_marketplace.repository.ListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ListingService {

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Transactional
    public Listing createListing(Listing listing, User seller, List<MultipartFile> images) throws IOException {
        listing.setSeller(seller);
        listing.setStatus(ListingStatus.AVAILABLE);
        
        // Save listing first to get the ID
        Listing savedListing = listingRepository.save(listing);

        // Handle image uploads
        if (images != null && !images.isEmpty()) {
            for (int i = 0; i < images.size(); i++) {
                MultipartFile image = images.get(i);
                String imageUrl = fileStorageService.storeFile(image);
                
                ListingImage listingImage = new ListingImage();
                listingImage.setImageUrl(imageUrl);
                listingImage.setPrimary(i == 0); // First image is primary
                listingImage.setListing(savedListing);
                
                savedListing.getImages().add(listingImage);
            }
        }

        return listingRepository.save(savedListing);
    }

    @Transactional(readOnly = true)
    public Page<Listing> getAllListings(Pageable pageable) {
        return listingRepository.findByStatus(ListingStatus.AVAILABLE, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Listing> searchListings(String keyword, Pageable pageable) {
        return listingRepository.searchByKeyword(keyword, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Listing> getListingsByCategory(String category, Pageable pageable) {
        return listingRepository.findByCategory(category, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Listing> getListingsByPriceRange(Double minPrice, Double maxPrice, Pageable pageable) {
        return listingRepository.findByPriceRangeAndStatus(minPrice, maxPrice, ListingStatus.AVAILABLE, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Listing> getUserListings(User user, Pageable pageable) {
        return listingRepository.findBySeller(user, pageable);
    }

    @Transactional
    public Listing updateListingStatus(Long listingId, ListingStatus status) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        listing.setStatus(status);
        return listingRepository.save(listing);
    }

    @Transactional
    public void deleteListing(Long listingId) {
        listingRepository.deleteById(listingId);
    }

    @Transactional(readOnly = true)
    public Listing getListing(Long listingId) {
        return listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
    }
} 