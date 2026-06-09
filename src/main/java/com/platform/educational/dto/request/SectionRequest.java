package com.platform.educational.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SectionRequest {
    @NotBlank
    private String title;
    private String description;
    private int position;
}
