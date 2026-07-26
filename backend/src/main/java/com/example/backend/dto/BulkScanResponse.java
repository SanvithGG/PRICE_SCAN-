package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkScanResponse {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BulkItem {
        private String query;
        private Double bestPrice;
        private String store;
    }

    private List<BulkItem> items;
}
