package com.sjsu.marketplace.sjsu_marketplace.service;

import com.sjsu.marketplace.sjsu_marketplace.model.Listing;
import com.sjsu.marketplace.sjsu_marketplace.model.Message;
import com.sjsu.marketplace.sjsu_marketplace.model.User;
import com.sjsu.marketplace.sjsu_marketplace.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ListingService listingService;

    @Transactional
    public Message sendMessage(Long senderId, Long receiverId, Long listingId, String content) {
        User sender = userService.getUserById(senderId);
        User receiver = userService.getUserById(receiverId);
        Listing listing = listingId != null ? listingService.getListing(listingId) : null;

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setListing(listing);
        message.setContent(content);

        return messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public Page<Message> getUserMessages(User user, Pageable pageable) {
        return messageRepository.findUserMessages(user, pageable);
    }

    @Transactional(readOnly = true)
    public List<Message> getConversation(User user1, User user2) {
        return messageRepository.findConversation(user1, user2);
    }

    @Transactional
    public void markMessageAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setRead(true);
        messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public long getUnreadMessageCount(User user) {
        return messageRepository.countUnreadMessages(user);
    }
} 