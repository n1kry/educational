package com.platform.educational.controller;

import com.platform.educational.dto.response.CourseResponse;
import com.platform.educational.dto.response.UserResponse;
import com.platform.educational.entity.User;
import com.platform.educational.repository.UserRepository;
import com.platform.educational.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final CourseService courseService;

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @PatchMapping("/users/{id}/toggle-active")
    public ResponseEntity<Void> toggleActive(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setActive(!user.isActive());
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<Void> changeRole(@PathVariable Long id, @RequestParam String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        try {
            user.setRole(com.platform.educational.entity.enums.Role.valueOf(role));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + role);
        }
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/courses")
    public List<CourseResponse> getAllCourses() {
        return courseService.getAllCourses();
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    private UserResponse toDto(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole().name())
                .active(u.isActive())
                .createdAt(u.getCreatedAt() != null ? u.getCreatedAt().toString() : "")
                .build();
    }
}
