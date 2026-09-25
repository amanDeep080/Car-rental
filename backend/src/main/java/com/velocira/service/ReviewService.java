package com.velocira.service;

import com.velocira.dto.review.ReviewResponse;
import com.velocira.dto.review.ReviewSubmitRequest;
import com.velocira.entity.Booking;
import com.velocira.entity.Review;
import com.velocira.entity.User;
import com.velocira.entity.enums.BookingStatus;
import com.velocira.exception.ResourceNotFoundException;
import com.velocira.repository.BookingRepository;
import com.velocira.repository.ReviewRepository;
import com.velocira.repository.UserRepository;
import com.velocira.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponse submit(ReviewSubmitRequest req) {
        User user = currentUser();
        Booking booking = bookingRepository.findByBookingReference(req.bookingReference())
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This booking does not belong to you.");
        }
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You can only review a completed rental.");
        }
        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You've already reviewed this booking.");
        }

        Review review = new Review();
        review.setBooking(booking);
        review.setUser(user);
        review.setCar(booking.getCar());
        review.setOverallRating(req.overallRating());
        review.setCleanlinessRating(req.cleanlinessRating());
        review.setConditionRating(req.conditionRating());
        review.setComment(req.comment());

        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    public List<ReviewResponse> getForCar(UUID carId) {
        return reviewRepository.findAllByCarIdAndModerationStatusOrderByCreatedAtDesc(carId, "PUBLISHED").stream()
            .map(this::toResponse)
            .toList();
    }

    private ReviewResponse toResponse(Review r) {
        return new ReviewResponse(
            r.getId(), r.getUser().getFullName(), r.getOverallRating(),
            r.getCleanlinessRating(), r.getConditionRating(), r.getComment(), r.getCreatedAt()
        );
    }

    private User currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in to continue.");
        }
        return userRepository.findById(principal.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account no longer exists."));
    }
}
