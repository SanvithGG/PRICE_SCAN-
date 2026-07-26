package com.example.backend.service;

import com.example.backend.dto.BulkScanRequest;
import com.example.backend.dto.BulkScanResponse;
import com.example.backend.dto.ScanRequest;
import com.example.backend.dto.ScanResponse;
import com.example.backend.model.SearchHistory;
import com.example.backend.model.SearchResult;
import com.example.backend.repository.SearchHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PriceScanService {

    private final SearchHistoryRepository searchHistoryRepository;

    private static final List<String> WATCH_IMAGES = List.of(
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80"
    );

    private static final List<String> TECH_IMAGES = List.of(
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80"
    );

    public ScanResponse search(ScanRequest request) {
        String query = Optional.ofNullable(request.getQuery()).filter(q -> !q.isBlank()).orElse("watch").trim();
        String region = Optional.ofNullable(request.getRegion()).orElse("both");
        String siteFilter = Optional.ofNullable(request.getSiteFilter()).orElse("all");
        String sortOption = Optional.ofNullable(request.getSortOption()).orElse("price-asc");

        // Save to DB history
        try {
            searchHistoryRepository.save(SearchHistory.builder()
                    .query(query)
                    .region(region)
                    .userEmail(request.getUserEmail())
                    .build());
        } catch (Exception ignored) {}

        List<SearchResult> allResults = generateMockData(query, region);

        // Apply site filter
        if (!"all".equalsIgnoreCase(siteFilter)) {
            allResults = allResults.stream()
                    .filter(r -> r.getSite().toLowerCase().contains(siteFilter.toLowerCase()) || r.getStore().toLowerCase().contains(siteFilter.toLowerCase()))
                    .toList();
        }

        // Apply sort
        List<SearchResult> sortedResults = new ArrayList<>(allResults);
        if ("price-asc".equalsIgnoreCase(sortOption)) {
            sortedResults.sort((a, b) -> {
                Double p1 = (a != null) ? a.getPrice() : null;
                Double p2 = (b != null) ? b.getPrice() : null;
                if (p1 == null && p2 == null) return 0;
                if (p1 == null) return 1;
                if (p2 == null) return -1;
                return p1.compareTo(p2);
            });
        } else if ("price-desc".equalsIgnoreCase(sortOption)) {
            sortedResults.sort((a, b) -> {
                Double p1 = (a != null) ? a.getPrice() : null;
                Double p2 = (b != null) ? b.getPrice() : null;
                if (p1 == null && p2 == null) return 0;
                if (p1 == null) return 1;
                if (p2 == null) return -1;
                return p2.compareTo(p1);
            });
        } else if ("rating".equalsIgnoreCase(sortOption)) {
            sortedResults.sort((a, b) -> {
                Double r1 = (a != null) ? a.getRating() : null;
                Double r2 = (b != null) ? b.getRating() : null;
                if (r1 == null && r2 == null) return 0;
                if (r1 == null) return 1;
                if (r2 == null) return -1;
                return r2.compareTo(r1);
            });
        }

        SearchResult winner = sortedResults.stream()
                .filter(r -> Boolean.TRUE.equals(r.getIsWinner()))
                .findFirst()
                .orElse(!sortedResults.isEmpty() ? sortedResults.get(0) : null);

        return ScanResponse.builder()
                .query(query)
                .region(region)
                .results(sortedResults)
                .winner(winner)
                .totalCount(sortedResults.size())
                .build();
    }

    public BulkScanResponse bulkScan(BulkScanRequest request) {
        List<String> items = new ArrayList<>();
        if (request.getQueries() != null && !request.getQueries().isEmpty()) {
            items.addAll(request.getQueries());
        } else if (request.getTextInput() != null) {
            Arrays.stream(request.getTextInput().split("\n"))
                    .map(line -> line.trim())
                    .filter(s -> !s.isEmpty())
                    .forEach(items::add);
        }

        List<String> stores = List.of("Amazon", "Flipkart", "Walmart", "Reliance Digital", "eBay", "Croma");
        Random random = new Random();

        List<BulkScanResponse.BulkItem> results = items.stream().map(q -> {
            double price = Math.round((25 + random.nextDouble() * 300) * 100.0) / 100.0;
            String store = stores.get(random.nextInt(stores.size()));
            return BulkScanResponse.BulkItem.builder()
                    .query(q)
                    .bestPrice(price)
                    .store(store)
                    .build();
        }).toList();

        return BulkScanResponse.builder().items(results).build();
    }

    private List<SearchResult> generateMockData(String queryStr, String reg) {
        String q = queryStr.toLowerCase();
        List<SearchResult> items = new ArrayList<>();

        if (q.contains("watch")) {
            items.add(SearchResult.builder().id("w1").title("Timex Expedition Scout 40mm Quartz Watch").site("Walmart").store("WALMART").price(42.99).currency("$").rating(4.3).reviews(3500).region("global").url("https://www.walmart.com").image(WATCH_IMAGES.get(0)).badge("Walmart").isWinner(false).build());
            items.add(SearchResult.builder().id("w2").title("Fitbit Charge 6 Fitness Tracker").site("Best Buy").store("BEST BUY").price(159.99).currency("$").rating(4.1).reviews(800).region("global").url("https://www.bestbuy.com").image(WATCH_IMAGES.get(1)).badge("Best Buy").isWinner(false).build());
            items.add(SearchResult.builder().id("w3").title("Seiko 5 Sports Automatic Men's Watch").site("eBay").store("EBAY").price(285.50).currency("$").rating(4.7).reviews(128).region("global").url("https://www.ebay.com").image(WATCH_IMAGES.get(2)).badge("eBay").isWinner(false).build());
            items.add(SearchResult.builder().id("w4").title("Apple Watch Series 9 GPS 41mm").site("Amazon").store("AMAZON").price(399.00).currency("$").rating(4.8).reviews(12456).region("global").url("https://www.amazon.com").image(WATCH_IMAGES.get(3)).badge("Amazon").isWinner(false).build());
            items.add(SearchResult.builder().id("w5").title("Noise ColorFit Pulse 3 Smartwatch").site("Reliance Digital").store("RELIANCE DIGITAL").price(19.99).currency("$").rating(4.0).reviews(1540).region("india").url("https://www.reliancedigital.in").image(WATCH_IMAGES.get(4)).badge("BEST DEAL").isWinner(true).build());
            items.add(SearchResult.builder().id("w6").title("Casio Vintage Digital Quartz Watch").site("Flipkart").store("FLIPKART").price(29.50).currency("$").rating(4.6).reviews(4920).region("india").url("https://www.flipkart.com").image(WATCH_IMAGES.get(5)).badge("Flipkart").isWinner(false).build());
            items.add(SearchResult.builder().id("w7").title("Fossil Gen 6 Touchscreen Smartwatch").site("Myntra").store("MYNTRA").price(189.50).currency("$").rating(4.2).reviews(730).region("india").url("https://www.myntra.com").image(WATCH_IMAGES.get(6)).badge("Myntra").isWinner(false).build());
            items.add(SearchResult.builder().id("w8").title("Garmin Forerunner 255 GPS Smartwatch").site("Croma").store("CROMA").price(349.99).currency("$").rating(4.9).reviews(1890).region("india").url("https://www.croma.com").image(WATCH_IMAGES.get(7)).badge("Croma").isWinner(false).build());
        } else {
            List<Map<String, String>> storesList = List.of(
                    Map.of("site", "Amazon", "store", "AMAZON", "region", "global", "img", TECH_IMAGES.get(0)),
                    Map.of("site", "Flipkart", "store", "FLIPKART", "region", "india", "img", TECH_IMAGES.get(1)),
                    Map.of("site", "Walmart", "store", "WALMART", "region", "global", "img", TECH_IMAGES.get(2)),
                    Map.of("site", "eBay", "store", "EBAY", "region", "global", "img", TECH_IMAGES.get(3)),
                    Map.of("site", "Reliance Digital", "store", "RELIANCE DIGITAL", "region", "india", "img", TECH_IMAGES.get(4)),
                    Map.of("site", "Myntra", "store", "MYNTRA", "region", "india", "img", TECH_IMAGES.get(5))
            );

            double basePrice = Math.max(15.0, (queryStr.length() * 37) % 450);
            for (int idx = 0; idx < storesList.size(); idx++) {
                Map<String, String> s = storesList.get(idx);
                double itemPrice = Math.round((basePrice + idx * 24.5 + (idx % 2 == 1 ? -12 : 18)) * 100.0) / 100.0;
                items.add(SearchResult.builder()
                        .id("gen-" + idx)
                        .title(capitalize(queryStr) + " " + List.of("Pro", "Ultra", "Edition", "Special", "Lite", "Plus").get(idx % 6))
                        .site(s.get("site"))
                        .store(s.get("store"))
                        .price(itemPrice)
                        .currency("$")
                        .rating(Math.round((4.0 + (idx % 10) * 0.1) * 10.0) / 10.0)
                        .reviews(450 + idx * 820)
                        .region(s.get("region"))
                        .url("https://www." + s.get("site").toLowerCase().replace(" ", "") + ".com/search?q=" + queryStr)
                        .image(s.get("img"))
                        .badge(s.get("site"))
                        .isWinner(idx == 0)
                        .build());
            }
            items.sort((a, b) -> {
                Double p1 = (a != null) ? a.getPrice() : null;
                Double p2 = (b != null) ? b.getPrice() : null;
                if (p1 == null && p2 == null) return 0;
                if (p1 == null) return 1;
                if (p2 == null) return -1;
                return p1.compareTo(p2);
            });
            items.get(0).setIsWinner(true);
            items.get(0).setBadge("BEST DEAL");
        }

        if ("both".equalsIgnoreCase(reg)) {
            return items;
        }
        return items.stream().filter(i -> reg.equalsIgnoreCase(i.getRegion())).toList();
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}
