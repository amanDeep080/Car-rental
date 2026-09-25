-- V5__payments_inspections_reviews.sql

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    gateway_order_id VARCHAR(120),
    gateway_payment_id VARCHAR(120),
    status VARCHAR(20) NOT NULL DEFAULT 'INITIATED',
    provider VARCHAR(30) NOT NULL DEFAULT 'RAZORPAY',
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_gateway_order ON payments(gateway_order_id);

CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    event_type VARCHAR(40) NOT NULL,
    raw_payload TEXT,
    resulting_status VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    payment_id UUID REFERENCES payments(id),
    amount NUMERIC(10,2) NOT NULL,
    refund_type VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reason TEXT,
    gateway_refund_id VARCHAR(120),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE vehicle_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    inspection_type VARCHAR(10) NOT NULL,
    recorded_by_user_id UUID NOT NULL REFERENCES users(id),
    front_condition TEXT,
    rear_condition TEXT,
    left_side_condition TEXT,
    right_side_condition TEXT,
    interior_condition TEXT,
    wheels_condition TEXT,
    fuel_level_percent INT,
    odometer_reading INT,
    existing_damage_notes TEXT,
    customer_acknowledged BOOLEAN NOT NULL DEFAULT false,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_inspections_booking ON vehicle_inspections(booking_id);

CREATE TABLE inspection_photos (
    inspection_id UUID NOT NULL REFERENCES vehicle_inspections(id) ON DELETE CASCADE,
    photo_url VARCHAR(500) NOT NULL
);

CREATE TABLE damage_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    charge_type VARCHAR(20) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    description TEXT,
    recorded_by_admin_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
    user_id UUID NOT NULL REFERENCES users(id),
    car_id UUID NOT NULL REFERENCES cars(id),
    overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    cleanliness_rating INT CHECK (cleanliness_rating BETWEEN 1 AND 5),
    condition_rating INT CHECK (condition_rating BETWEEN 1 AND 5),
    comment TEXT,
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_reviews_car ON reviews(car_id, moderation_status);
