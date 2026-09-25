-- V3__booking_flow_tables.sql

CREATE TABLE addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(80) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    pricing_type VARCHAR(20) NOT NULL DEFAULT 'FLAT',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(40) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL,
    discount_value NUMERIC(10,2) NOT NULL,
    min_booking_amount NUMERIC(10,2),
    max_discount_amount NUMERIC(10,2),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    usage_limit INT,
    user_usage_limit INT DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id),
    user_id UUID NOT NULL REFERENCES users(id),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    document_type VARCHAR(30) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    expires_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by_admin_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_documents_user ON documents(user_id);

CREATE TABLE booking_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    addon_id UUID NOT NULL REFERENCES addons(id),
    addon_name_snapshot VARCHAR(80) NOT NULL,
    price_snapshot NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Seed add-ons
INSERT INTO addons (name, description, price, pricing_type) VALUES
    ('Zero Depreciation Insurance', 'Full protection cover — no deduction for depreciation on repair claims.', 499, 'PER_DAY'),
    ('Extra Mileage Pack', 'Add 100 km/day to your included mileage.', 299, 'PER_DAY'),
    ('Child Seat', 'Forward-facing child safety seat, fitted at pickup.', 199, 'FLAT'),
    ('GPS Navigator', 'Dedicated GPS unit with offline maps.', 149, 'FLAT'),
    ('Additional Driver', 'Add one more registered driver to this booking.', 399, 'FLAT');

-- Seed coupons — modeled on common self-drive-rental offer structures
-- (percentage-off, minimum-nights, and advance-booking discounts).
INSERT INTO coupons (code, discount_type, discount_value, min_booking_amount, max_discount_amount, start_date, end_date, usage_limit, user_usage_limit) VALUES
    ('NRI10', 'PERCENTAGE', 10, NULL, 2000, now(), now() + interval '1 year', NULL, 1),
    ('WEEKEND15', 'PERCENTAGE', 15, 5000, 3000, now(), now() + interval '1 year', NULL, 2),
    ('EARLYBIRD5', 'PERCENTAGE', 5, NULL, 1000, now(), now() + interval '1 year', NULL, NULL);
