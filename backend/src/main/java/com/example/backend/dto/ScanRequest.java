package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScanRequest {

    private String query;
    private String region;
    private String siteFilter;
    private String sortOption;
    private String userEmail;
}
