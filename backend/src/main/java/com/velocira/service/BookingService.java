package com.velocira.service;

import com.velocira.config.BusinessProperties;
import com.velocira.dto.booking.BookingCreateRequest;
import com.velocira.dto.booking.BookingResponse;
import com.velocira.entity.*;
import com.velocira.entity.enums.BookingStatus;
import com.velocira.exception.ResourceNotFoundException;
import com.velocira.repository.*;
import com.velocira.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingAddonRepository bookingAddonRepository;
    private final BookingStatusHistoryRepository statusHistoryRepository;
    private final CarRepository carRepository;
    private final LocationRepository locationRepository;
    private final AddonRepository addonRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    private final AvailabilityService availabilityService;
    private final PricingService pricingService;
    private final CouponService couponService;
    private final BookingStatusTransitionValidator transitionValidator;
    private final BusinessProperties businessProperties;
    private final NotificationService notificationService;
    private final LiveNotificationService liveNotificationService;
    private final AuditLogService auditLogService;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public BookingResponse createBooking(BookingCreateRequest req) {
        try {
            log.info("Starting booking creation for car: {} by user on-behalf: {}", req.carId(), req.onBehalfOfUserId());
            User requester = currentUser();
            User user = requester;

            if (req.onBehalfOfUserId() != null) {
                boolean isAdmin = requester.getRoles().stream().anyMatch(r -> "ADMIN".equals(r.getName()));
                if (!isAdmin) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can book on behalf of users.");
                }
                user = userRepository.findById(req.onBehalfOfUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found."));
            }

            Car car = carRepository.findById(req.carId())
                .orElseThrow(() -> new ResourceNotFoundException("Car not found."));

            // Defensive status check (spec §18, §65)
            if (car.getStatus() == com.velocira.entity.enums.CarStatus.INACTIVE) {
                throw new com.velocira.exception.CarUnavailableException("This vehicle is currently inactive and cannot be booked.");
            }

            Location pickupLocation = locationRepository.findById(req.pickupLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Pickup location not found."));
            Location returnLocation = locationRepository.findById(req.returnLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Return location not found."));

            validateWindow(req.pickupAt(), req.returnAt());

            // Authoritative, lock-protected availability check — the final word
            // before we commit to this booking (spec §66).
            availabilityService.assertAvailableForBookingOrThrow(car.getId(), req.pickupAt(), req.returnAt());

            PricingService.PriceBreakdown price = pricingService.calculateRentalAmount(car, req.pickupAt(), req.returnAt());

            List<Addon> addons = req.addonIds() == null || req.addonIds().isEmpty()
                ? List.of()
                : addonRepository.findAllByIdInAndActiveTrue(req.addonIds());

            long rentalDays = Math.max(1, (long) Math.ceil(price.durationHours() / 24.0));
            BigDecimal addonsTotal = addons.stream()
                .map(a -> "PER_DAY".equals(a.getPricingType())
                    ? a.getPrice().multiply(BigDecimal.valueOf(rentalDays))
                    : a.getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal discount = BigDecimal.ZERO;
            Coupon appliedCoupon = null;
            if (req.couponCode() != null && !req.couponCode().isBlank()) {
                discount = couponService.validateAndCalculateDiscount(req.couponCode(), user.getId(), price.rentalAmount());
                appliedCoupon = couponService.getActiveCoupon(req.couponCode());
            }

            BigDecimal taxableBase = price.rentalAmount().add(addonsTotal).subtract(discount);
            BigDecimal tax = BigDecimal.ZERO; // Taxes removed per requirements
            BigDecimal totalPayable = taxableBase; // Only show rental amount in total

            Booking booking = new Booking();
            booking.setBookingReference(generateBookingReference());
            booking.setUser(user);
            booking.setCar(car);
            booking.setPickupLocation(pickupLocation);
            booking.setReturnLocation(returnLocation);
            booking.setPickupAt(req.pickupAt());
            booking.setReturnAt(req.returnAt());
            booking.setStatus(BookingStatus.PENDING);
            booking.setRentalAmount(price.rentalAmount());
            booking.setAddonsAmount(addonsTotal);
            booking.setTaxAmount(tax);
            booking.setDiscountAmount(discount);
            booking.setSecurityDepositAmount(BigDecimal.ZERO); // Security Deposit removed per requirements
            booking.setTotalPayable(totalPayable);
            booking.setCouponCode(appliedCoupon != null ? appliedCoupon.getCode() : null);
            booking.setPaymentMethod(
                req.paymentMethod() != null && req.paymentMethod().equalsIgnoreCase("COD") ? "COD" : "ONLINE"
            );

            Booking saved = bookingRepository.save(booking);
            recordTransition(saved, null, BookingStatus.PENDING, "SYSTEM", "Booking created");

            List<BookingResponse.BookingAddonLine> addonLines = new ArrayList<>();
            for (Addon addon : addons) {
                BookingAddon ba = new BookingAddon();
                ba.setBooking(saved);
                ba.setAddon(addon);
                ba.setAddonNameSnapshot(addon.getName());
                BigDecimal linePrice = "PER_DAY".equals(addon.getPricingType())
                    ? addon.getPrice().multiply(BigDecimal.valueOf(rentalDays))
                    : addon.getPrice();
                ba.setPriceSnapshot(linePrice);
                bookingAddonRepository.save(ba);
                addonLines.add(new BookingResponse.BookingAddonLine(addon.getName(), linePrice));
            }

            if (appliedCoupon != null) {
                CouponUsage usage = new CouponUsage();
                usage.setCoupon(appliedCoupon);
                usage.setUser(user);
                usage.setBooking(saved);
                couponUsageRepository.save(usage);
            }

            // Move to AWAITING_VERIFICATION — the customer still needs to submit
            // documents and pay before this becomes CONFIRMED (spec §22).
            transitionTo(saved, BookingStatus.AWAITING_VERIFICATION, "SYSTEM", "Awaiting document verification");

            notificationService.notify(
                user, "BOOKING_CREATED",
                "Booking received — " + saved.getBookingReference(),
                "We've received your booking for the " + car.getBrand() + " " + car.getModel() + ". "
                    + "Upload your documents to move forward.",
                java.util.Set.of("EMAIL")
            );

            liveNotificationService.notifyBookingAttempt(user.getEmail(), car.getBrand() + " " + car.getModel());
            auditLogService.record("BOOKING_CREATED", "BOOKING", saved.getId().toString(), saved.getBookingReference());

            return toResponse(saved, addonLines);
        } catch (Exception e) {
            log.error("CRITICAL: Booking creation failed!", e);
            throw e;
        }
    }

    public List<BookingResponse> getMyBookings() {
        User user = currentUser();
        return bookingRepository.findByUserIdOrderByPickupAtDesc(user.getId()).stream()
            .map(b -> toResponse(b, addonLinesFor(b)))
            .toList();
    }

    public BookingResponse getByReference(String reference) {
        Booking booking = bookingRepository.findByBookingReference(reference)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        assertOwnedByCurrentUserOrAdmin(booking);
        return toResponse(booking, addonLinesFor(booking));
    }

    @Transactional
    public void cancelBooking(String reference) {
        Booking booking = bookingRepository.findByBookingReference(reference)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found."));
        assertOwnedByCurrentUserOrAdmin(booking);

        if (!transitionValidator.isAllowed(booking.getStatus(), BookingStatus.CANCELLED)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "This booking can no longer be cancelled (current status: " + booking.getStatus() + ").");
        }
        transitionTo(booking, BookingStatus.CANCELLED, currentUser().getId().toString(), "Cancelled by customer");
    }

    // ---- internal helpers ----

    private void validateWindow(Instant pickupAt, Instant returnAt) {
        Instant now = Instant.now();
        // Allow a small grace period for network latency (e.g. 5 minutes)
        if (pickupAt.isBefore(now.minus(Duration.ofMinutes(5)))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pickup time cannot be in the past.");
        }
        if (!pickupAt.isBefore(returnAt)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Return time must be after pickup time.");
        }
        long hours = Duration.between(pickupAt, returnAt).toHours();
        if (hours < businessProperties.minRentalHours()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Minimum rental duration is " + businessProperties.minRentalHours() + " hours.");
        }
        long days = (long) Math.ceil(hours / 24.0);
        if (days > businessProperties.maxRentalDays()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Maximum rental duration is " + businessProperties.maxRentalDays() + " days.");
        }
    }

    private void transitionTo(Booking booking, BookingStatus to, String changedBy, String note) {
        transitionValidator.assertAllowed(booking.getStatus(), to);
        BookingStatus from = booking.getStatus();
        booking.setStatus(to);
        bookingRepository.save(booking);
        recordTransition(booking, from, to, changedBy, note);
    }

    private void recordTransition(Booking booking, BookingStatus from, BookingStatus to, String changedBy, String note) {
        BookingStatusHistory history = new BookingStatusHistory();
        history.setBooking(booking);
        history.setFromStatus(from == null ? to : from);
        history.setToStatus(to);
        history.setChangedBy(changedBy);
        history.setNote(note);
        statusHistoryRepository.save(history);
    }

    private String generateBookingReference() {
        int year = ZonedDateTime.now().getYear();
        String suffix = String.format("%06d", RANDOM.nextInt(1_000_000));
        String candidate = "VLC-" + year + "-" + suffix;
        // Extremely unlikely to collide, but guard anyway rather than trust randomness alone.
        return bookingRepository.findByBookingReference(candidate).isPresent()
            ? generateBookingReference()
            : candidate;
    }

    private User currentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in to continue.");
        }
        return userRepository.findById(principal.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account no longer exists."));
    }

    private void assertOwnedByCurrentUserOrAdmin(Booking booking) {
        User user = currentUser();
        boolean isAdmin = user.getRoles().stream().anyMatch(r -> "ADMIN".equals(r.getName()));
        if (!isAdmin && !booking.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This booking does not belong to you.");
        }
    }

    private List<BookingResponse.BookingAddonLine> addonLinesFor(Booking booking) {
        return bookingAddonRepository.findAllByBookingId(booking.getId()).stream()
            .map(ba -> new BookingResponse.BookingAddonLine(ba.getAddonNameSnapshot(), ba.getPriceSnapshot()))
            .toList();
    }

    private BookingResponse toResponse(Booking b, List<BookingResponse.BookingAddonLine> addonLines) {
        String primaryImage = b.getCar().getImages().stream()
            .findFirst().map(CarImage::getUrl).orElse("/images/cars/placeholder.jpg");

        return new BookingResponse(
            b.getId(),
            b.getBookingReference(),
            b.getStatus().name(),
            b.getCar().getId(),
            b.getCar().getBrand(),
            b.getCar().getModel(),
            b.getCar().getVariant(),
            primaryImage,
            b.getPickupLocation().getBranchName(),
            b.getReturnLocation().getBranchName(),
            b.getPickupAt(),
            b.getReturnAt(),
            Duration.between(b.getPickupAt(), b.getReturnAt()).toHours() / 24,
            Duration.between(b.getPickupAt(), b.getReturnAt()).toHours() % 24,
            b.getRentalAmount(),
            b.getAddonsAmount(),
            b.getTaxAmount(),
            b.getDiscountAmount(),
            b.getSecurityDepositAmount(),
            b.getTotalPayable(),
            b.getPaymentMethod(),
            addonLines
        );
    }
}
