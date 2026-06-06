package com.platform.educational.dto.response;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UserResponse {
    Long id;
    String name;
    String email;
    String role;
    boolean active;
    String createdAt;
}
