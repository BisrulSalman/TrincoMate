package com.trincomate.reviews.controller;

import com.trincomate.reviews.dto.CreateReviewRequest;
import com.trincomate.reviews.model.Review;
import com.trincomate.reviews.repository.ReviewRepository;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/reviews")
@Validated
public class ReviewController {

    private final ReviewRepository repo;

    @Value("${app.admin.token}")
    private String adminToken;

    // rate-limit buckets per client IP
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public ReviewController(ReviewRepository repo) {
        this.repo = repo;
    }

    private Bucket resolveBucket(String key) {
        return buckets.computeIfAbsent(key, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofHours(1))))
                .build());
    }

    @PostMapping
    public ResponseEntity<?> createReview(@Valid @RequestBody CreateReviewRequest req, HttpServletRequest httpReq) {
        String client = httpReq.getRemoteAddr();
        Bucket bucket = resolveBucket(client);
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(429).body("Too many requests");
        }

        // Only accept Gmail addresses
        if (!req.getEmail().toLowerCase().endsWith("@gmail.com")) {
            return ResponseEntity.badRequest().body("A valid Gmail address is required");
        }

        Review r = new Review();
        r.setName(req.getName().trim());
        r.setEmail(req.getEmail().trim());
        r.setRating(req.getRating());
        r.setMessage(req.getMessage().trim());
        r.setApproved(false);
        repo.save(r);
        return ResponseEntity.ok(Map.of("id", r.getId(), "status", "pending"));
    }

    @GetMapping
    public ResponseEntity<?> getApprovedReviews(@RequestHeader(value = "X-Admin-Token", required = false) String token) {
        // If an admin token is provided and valid, return all reviews for moderation.
        if (token != null && token.equals(adminToken)) {
            return ResponseEntity.ok(repo.findAll());
        }
        return ResponseEntity.ok(repo.findByApprovedTrueOrderByCreatedAtDesc());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, @RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (adminToken == null || adminToken.equals("change-me-to-secure-token")) {
            // Insecure default: allow if header matches property anyway
        }
        if (token == null || !token.equals(adminToken)) {
            return ResponseEntity.status(403).body("Admin token required");
        }
        return repo.findById(id).map(r -> {
            r.setApproved(true);
            repo.save(r);
            return ResponseEntity.ok(Map.of("id", r.getId(), "approved", true));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, @RequestHeader(value = "X-Admin-Token", required = false) String token) {
        if (token == null || !token.equals(adminToken)) {
            return ResponseEntity.status(403).body("Admin token required");
        }
        return repo.findById(id).map(r -> {
            repo.delete(r);
            return ResponseEntity.ok(Map.of("id", id, "deleted", true));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
