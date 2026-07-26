package com.example.backend.controller;

import com.example.backend.dto.BulkScanRequest;
import com.example.backend.dto.BulkScanResponse;
import com.example.backend.dto.ScanRequest;
import com.example.backend.dto.ScanResponse;
import com.example.backend.service.PriceScanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scan")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PriceScanController {

    private final PriceScanService priceScanService;

    @GetMapping("/search")
    public ResponseEntity<ScanResponse> search(
            @RequestParam(required = false, defaultValue = "watch") String query,
            @RequestParam(required = false, defaultValue = "both") String region,
            @RequestParam(required = false, defaultValue = "all") String siteFilter,
            @RequestParam(required = false, defaultValue = "price-asc") String sortOption,
            @RequestParam(required = false) String userEmail
    ) {
        ScanRequest request = ScanRequest.builder()
                .query(query)
                .region(region)
                .siteFilter(siteFilter)
                .sortOption(sortOption)
                .userEmail(userEmail)
                .build();

        ScanResponse response = priceScanService.search(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/search")
    public ResponseEntity<ScanResponse> searchPost(@RequestBody ScanRequest request) {
        ScanResponse response = priceScanService.search(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/bulk")
    public ResponseEntity<BulkScanResponse> bulkScan(@RequestBody BulkScanRequest request) {
        BulkScanResponse response = priceScanService.bulkScan(request);
        return ResponseEntity.ok(response);
    }
}
