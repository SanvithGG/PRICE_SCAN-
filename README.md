# ⚡ PRICE/SCAN — Live Price Intelligence Platform

> **One search. Every store.**
> A modern, high-performance full-stack price intelligence platform that cross-checks product listings across global and regional e-commerce stores (Amazon, Flipkart, Walmart, eBay, Myntra, Reliance Digital, Croma, Best Buy) and instantly awards the price winner.

---

## 🔥 Features & Highlights

- **⚡ Instant Multi-Store Scanning**: Cross-checks price listings across 8+ e-commerce platforms in real time.
- **🏆 Winner Auto-Selection**: Automatically calculates and highlights the verified best deal listing based on price and store rating.
- **🎨 Vibrant Neon Dark UI**: Modern dark aesthetic with glassmorphism, animated scanline laser effects, staggered entrance transitions, and neon glow micro-interactions.
- **📦 Bulk Price Scanner**: Scan multiple items concurrently via a sleek line-delimited bulk input modal with real-time winner tables.
- **☕ Spring Boot Structured Backend**: Production-ready Java 21 architecture featuring decoupled Config, DTO, Entity, Repository, Service, and REST Controller layers with JPA and H2/MySQL database support.
- **🛡️ Secure Auth & History Tracking**: User account registration, login, and search query history tracking.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Angular 19+ (Standalone Components, Signals & RxJS)
- **Styling**: Vanilla CSS3 + Tailwind CSS v4, custom keyframe animations, JetBrains Mono & Space Grotesk typography
- **HTTP Client**: Angular `HttpClient` with fetch API integration

### Backend
- **Framework**: Spring Boot 3.4+ / Java 21
- **Security & CORS**: Spring Security 6, BCrypt Password Encoder, custom WebMvc CORS mappings
- **Data & Persistence**: Spring Data JPA, Hibernate, H2 In-Memory Database (with H2 Web Console at `/h2-console`)
- **Build Tool**: Apache Maven

---

## 🏗️ Project Architecture

```
PRICE_SCAN/
├── frontend/                  # Angular Single Page Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/          # Login & Signup component
│   │   │   ├── home/          # Hero search, live terminal log & product grid
│   │   │   ├── services/      # PriceScanService with backend API & fallback
│   │   │   ├── app.html       # Top navigation bar & Bulk modal
│   │   │   └── app.ts
│   │   └── styles.css         # Keyframe animations & custom utility classes
│   └── package.json
│
└── backend/                   # Spring Boot REST API
    ├── src/main/java/com/example/backend/
    │   ├── config/            # CorsConfig, SecurityConfig
    │   ├── controller/        # AuthController, PriceScanController
    │   ├── dto/               # AuthRequest, ScanResponse, BulkScanRequest, etc.
    │   ├── model/             # User, SearchResult, SearchHistory entities
    │   ├── repository/        # UserRepository, SearchHistoryRepository
    │   └── service/           # AuthService, PriceScanService
    ├── src/main/resources/
    │   └── application.properties
    └── pom.xml
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) & `npm`
- Java Development Kit (JDK 21+)

### 1. Running the Spring Boot Backend
```bash
cd backend
./mvnw spring-boot:run
```
The REST API will start at `http://localhost:8080` (H2 Web Console available at `http://localhost:8080/h2-console`).

### 2. Running the Angular Frontend
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:4200` to start scanning prices!

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/scan/search?query=...&region=...` | Execute live multi-store price scan |
| `POST` | `/api/scan/bulk` | Run batch price comparison across multiple products |
| `POST` | `/api/auth/signup` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate user credentials |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
