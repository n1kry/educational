package com.platform.educational.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder
public class QuestionResponse {
    private Long id;
    private String text;
    private List<OptionResponse> options;

    @Data @Builder
    public static class OptionResponse {
        private String optionKey;
        private String text;
    }
}
