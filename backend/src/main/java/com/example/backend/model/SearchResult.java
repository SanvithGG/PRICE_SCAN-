package com.example.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResult {

    private String id;
    private String title;
    private String site;
    private String store;
    private Double price;
    private String currency;
    private Double rating;
    private Integer reviews;
    private String region;
    private String url;
    private String image;
    private String badge;
    private Boolean isWinner;
}
