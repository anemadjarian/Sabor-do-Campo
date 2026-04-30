package com.sabordocampo.user.web;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sabordocampo.user.dto.UserRequest;
import com.sabordocampo.user.dto.UserResponse;
import com.sabordocampo.user.service.UserService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/me")
    public UserResponse getUser(Authentication authentication) {
        return userService.getUser(authentication.getName());
    }

    @PostMapping("/users")
    public UserResponse createUser(@RequestBody UserRequest request) {
        return userService.createUser(request);
    }

    @DeleteMapping("users/me")
    public void removeUser(Authentication authentication) {
        userService.removeUser(authentication.getName());
    }

    @PutMapping("/users/me")
    public void updateUser(Authentication authentication, @RequestBody UserRequest request) {
        userService.updateUser(authentication.getName(), request);
    }
}
