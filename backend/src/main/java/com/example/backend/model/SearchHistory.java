package com.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "search_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String query;

    private String userEmail;

    private String region;

    private LocalDateTime searchedAt;

    @PrePersist
    protected void onCreate() {
        this.searchedAt = LocalDateTime.now();
    }
}
