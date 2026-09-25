-- V1__init_core_schema.sql
-- Core tables for auth, locations, fleet, and bookings.
-- Later phases add: documents, payments, deposits, coupons, reviews,
-- notifications, audit_logs, pricing_rules, addons.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(40) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash TEXT NOT NULL,
    date_of_birth DATE,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city VARCHAR(120) NOT NULL,
    branch_name VARCHAR(160) NOT NULL,
    address VARCHAR(300) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    contact_number VARCHAR(20),
    opening_hours TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(160) NOT NULL UNIQUE,
    brand VARCHAR(60) NOT NULL,
    model VARCHAR(60) NOT NULL,
    variant VARCHAR(60),
    year INT NOT NULL,
    registration_number VARCHAR(30),
    category VARCHAR(40) NOT NULL,
    fuel VARCHAR(20) NOT NULL,
    transmission VARCHAR(20) NOT NULL,
    seats INT NOT NULL,
    doors INT,
    engine VARCHAR(100),
    power VARCHAR(50),
    mileage_policy VARCHAR(120),
    price_per_day NUMERIC(10,2) NOT NULL,
    price_per_six_hours NUMERIC(10,2),
    price_per_twelve_hours NUMERIC(10,2),
    price_per_twenty_four_hours NUMERIC(10,2),
    price_per_week NUMERIC(10,2),
    price_per_month NUMERIC(10,2),
    security_deposit NUMERIC(10,2) NOT NULL,
    location_id UUID NOT NULL REFERENCES locations(id),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    description TEXT,
    rental_policy TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_cars_status ON cars(status);

CREATE TABLE car_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    category VARCHAR(30),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE car_features (
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    feature VARCHAR(80) NOT NULL
);

CREATE TABLE vehicle_blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    reason VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_blocked_dates_car_window ON vehicle_blocked_dates(car_id, starts_at, ends_at);

CREATE TABLE vehicle_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    service_type VARCHAR(60) NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    mileage_at_service INT,
    cost NUMERIC(10,2),
    notes TEXT,
    next_service_date TIMESTAMPTZ,
    next_service_mileage INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_maintenance_car_window ON vehicle_maintenance(car_id, starts_at, ends_at);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(20) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id),
    car_id UUID NOT NULL REFERENCES cars(id),
    pickup_location_id UUID NOT NULL REFERENCES locations(id),
    return_location_id UUID NOT NULL REFERENCES locations(id),
    pickup_at TIMESTAMPTZ NOT NULL,
    return_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING',
    rental_amount NUMERIC(10,2) NOT NULL,
    addons_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    security_deposit_amount NUMERIC(10,2) NOT NULL,
    total_payable NUMERIC(10,2) NOT NULL,
    coupon_code VARCHAR(40),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_booking_window CHECK (return_at > pickup_at)
);
-- Central index backing the availability engine's overlap query (spec §65-66).
CREATE INDEX idx_bookings_car_window ON bookings(car_id, pickup_at, return_at);
CREATE INDEX idx_bookings_status ON bookings(status);

CREATE TABLE booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    from_status VARCHAR(24) NOT NULL,
    to_status VARCHAR(24) NOT NULL,
    note VARCHAR(300),
    changed_by VARCHAR(60),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Seed roles
INSERT INTO roles (name, description) VALUES
    ('CUSTOMER', 'Rents and drives vehicles'),
    ('ADMIN', 'Full operational access');
