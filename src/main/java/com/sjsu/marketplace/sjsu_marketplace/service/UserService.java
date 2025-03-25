package com.sjsu.marketplace.sjsu_marketplace.service;

import com.sjsu.marketplace.sjsu_marketplace.model.User;
import com.sjsu.marketplace.sjsu_marketplace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateUserProfile(Long userId, User updatedUser) {
        User user = getUserById(userId);
        
        // Update only allowed fields
        if (updatedUser.getProfilePicture() != null) {
            user.setProfilePicture(updatedUser.getProfilePicture());
        }
        
        return userRepository.save(user);
    }
} 