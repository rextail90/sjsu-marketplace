package com.sjsu.marketplace.sjsu_marketplace.controller;

import com.sjsu.marketplace.sjsu_marketplace.model.Message;
import com.sjsu.marketplace.sjsu_marketplace.model.User;
import com.sjsu.marketplace.sjsu_marketplace.service.MessageService;
import com.sjsu.marketplace.sjsu_marketplace.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<Message> sendMessage(
            @RequestBody Map<String, Object> messageRequest,
            Authentication authentication) {
        User sender = userService.getUserByUsername(authentication.getName());
        User receiver = userService.getUserById(Long.parseLong(messageRequest.get("receiverId").toString()));
        Long listingId = messageRequest.get("listingId") != null ? 
                Long.parseLong(messageRequest.get("listingId").toString()) : null;
        String content = (String) messageRequest.get("content");

        return ResponseEntity.ok(messageService.sendMessage(
                sender.getId(),
                receiver.getId(),
                listingId,
                content
        ));
    }

    @GetMapping
    public ResponseEntity<Page<Message>> getUserMessages(
            Authentication authentication,
            Pageable pageable) {
        User user = userService.getUserByUsername(authentication.getName());
        return ResponseEntity.ok(messageService.getUserMessages(user, pageable));
    }

    @GetMapping("/conversation/{userId}")
    public ResponseEntity<List<Message>> getConversation(
            @PathVariable Long userId,
            Authentication authentication) {
        User currentUser = userService.getUserByUsername(authentication.getName());
        User otherUser = userService.getUserById(userId);
        return ResponseEntity.ok(messageService.getConversation(currentUser, otherUser));
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markMessageAsRead(@PathVariable Long messageId) {
        messageService.markMessageAsRead(messageId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadMessageCount(Authentication authentication) {
        User user = userService.getUserByUsername(authentication.getName());
        return ResponseEntity.ok(messageService.getUnreadMessageCount(user));
    }
} 