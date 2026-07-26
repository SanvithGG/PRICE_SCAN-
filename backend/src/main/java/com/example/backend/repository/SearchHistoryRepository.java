package com.example.backend.repository;

import com.example.backend.model.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {

    List<SearchHistory> findTop10ByUserEmailOrderBySearchedAtDesc(String userEmail);

    List<SearchHistory> findTop10ByOrderBySearchedAtDesc();
}
