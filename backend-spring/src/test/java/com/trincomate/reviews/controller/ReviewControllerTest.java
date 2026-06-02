package com.trincomate.reviews.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trincomate.reviews.dto.CreateReviewRequest;
import com.trincomate.reviews.model.Review;
import com.trincomate.reviews.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReviewController.class)
public class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReviewRepository reviewRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private CreateReviewRequest validRequest;
    private Review review;

    @BeforeEach
    void setUp() {
        validRequest = new CreateReviewRequest();
        validRequest.setName("John Doe");
        validRequest.setEmail("johndoe@gmail.com");
        validRequest.setRating(5);
        validRequest.setMessage("Great place!");

        review = new Review();
        review.setId(1L);
        review.setName("John Doe");
        review.setEmail("johndoe@gmail.com");
        review.setRating(5);
        review.setMessage("Great place!");
        review.setApproved(false);
    }

    @Test
    void createReview_ValidRequest_ReturnsOk() throws Exception {
        when(reviewRepository.save(any(Review.class))).thenReturn(review);

        mockMvc.perform(post("/api/reviews")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest))
                .header("X-Forwarded-For", "192.168.1.1")) // Fake IP to avoid rate limit clash
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("pending"));

        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test
    void createReview_NonGmail_ReturnsBadRequest() throws Exception {
        validRequest.setEmail("johndoe@yahoo.com");

        mockMvc.perform(post("/api/reviews")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest))
                .header("X-Forwarded-For", "192.168.1.2"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("A valid Gmail address is required"));

        verify(reviewRepository, never()).save(any());
    }

    @Test
    void createReview_RateLimitExceeded_Returns429() throws Exception {
        // Submit 5 valid requests (the bucket limit)
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/reviews")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(validRequest))
                    .header("X-Forwarded-For", "192.168.1.3"))
                    .andExpect(status().isOk());
        }

        // The 6th request should fail with 429 Too Many Requests
        mockMvc.perform(post("/api/reviews")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRequest))
                .header("X-Forwarded-For", "192.168.1.3"))
                .andExpect(status().isTooManyRequests())
                .andExpect(content().string("Too many requests"));
    }

    @Test
    void getApprovedReviews_NoToken_ReturnsOnlyApproved() throws Exception {
        when(reviewRepository.findByApprovedTrueOrderByCreatedAtDesc()).thenReturn(List.of(review));

        mockMvc.perform(get("/api/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("John Doe"));

        verify(reviewRepository, times(1)).findByApprovedTrueOrderByCreatedAtDesc();
        verify(reviewRepository, never()).findAll();
    }

    @Test
    void getApprovedReviews_ValidAdminToken_ReturnsAll() throws Exception {
        when(reviewRepository.findAll()).thenReturn(List.of(review));

        mockMvc.perform(get("/api/reviews")
                .header("X-Admin-Token", "change-me-to-secure-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("John Doe"));

        verify(reviewRepository, times(1)).findAll();
        verify(reviewRepository, never()).findByApprovedTrueOrderByCreatedAtDesc();
    }

    @Test
    void approveReview_ValidAdminToken_ReturnsOk() throws Exception {
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any(Review.class))).thenReturn(review);

        mockMvc.perform(put("/api/reviews/1/approve")
                .header("X-Admin-Token", "change-me-to-secure-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.approved").value(true));

        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test
    void approveReview_MissingAdminToken_ReturnsForbidden() throws Exception {
        mockMvc.perform(put("/api/reviews/1/approve"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Admin token required"));

        verify(reviewRepository, never()).save(any());
    }

    @Test
    void deleteReview_ValidAdminToken_ReturnsOk() throws Exception {
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        doNothing().when(reviewRepository).delete(any(Review.class));

        mockMvc.perform(delete("/api/reviews/1")
                .header("X-Admin-Token", "change-me-to-secure-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deleted").value(true));

        verify(reviewRepository, times(1)).delete(any(Review.class));
    }

    @Test
    void deleteReview_MissingAdminToken_ReturnsForbidden() throws Exception {
        mockMvc.perform(delete("/api/reviews/1"))
                .andExpect(status().isForbidden())
                .andExpect(content().string("Admin token required"));

        verify(reviewRepository, never()).delete(any());
    }
}
