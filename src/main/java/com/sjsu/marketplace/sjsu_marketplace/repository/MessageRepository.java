package com.sjsu.marketplace.sjsu_marketplace.repository;

import com.sjsu.marketplace.sjsu_marketplace.model.Message;
import com.sjsu.marketplace.sjsu_marketplace.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :user OR m.receiver = :user) " +
           "ORDER BY m.createdAt DESC")
    Page<Message> findUserMessages(User user, Pageable pageable);
    
    @Query("SELECT m FROM Message m WHERE " +
           "((m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1)) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findConversation(User user1, User user2);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE " +
           "m.receiver = :user AND m.isRead = false")
    long countUnreadMessages(User user);
} 