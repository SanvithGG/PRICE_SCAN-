package com.example.backend.dto;

import com.example.backend.model.SearchResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScanResponse {

    private String query;
    private String region;
    private List<SearchResult> results;
    private SearchResult winner;
    private int totalCount;
}
