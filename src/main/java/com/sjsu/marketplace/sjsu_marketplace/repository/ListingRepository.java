package com.sjsu.marketplace.sjsu_marketplace.repository;

import com.sjsu.marketplace.sjsu_marketplace.model.Listing;
import com.sjsu.marketplace.sjsu_marketplace.model.ListingStatus;
import com.sjsu.marketplace.sjsu_marketplace.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {
    Page<Listing> findByStatus(ListingStatus status, Pageable pageable);
    Page<Listing> findBySeller(User seller, Pageable pageable);
    Page<Listing> findByCategory(String category, Pageable pageable);
    
    @Query("SELECT l FROM Listing l WHERE " +
           "LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(l.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Listing> searchByKeyword(String keyword, Pageable pageable);
    
    @Query("SELECT l FROM Listing l WHERE " +
           "l.price BETWEEN :minPrice AND :maxPrice AND " +
           "l.status = :status")
    Page<Listing> findByPriceRangeAndStatus(
            Double minPrice,
            Double maxPrice,
            ListingStatus status,
            Pageable pageable
    );
} 