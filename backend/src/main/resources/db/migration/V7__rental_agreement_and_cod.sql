-- V7__rental_agreement_and_cod.sql

ALTER TABLE cars ADD COLUMN chassis_number VARCHAR(40);
ALTER TABLE cars ADD COLUMN engine_number VARCHAR(40);

-- Placeholder chassis/engine numbers for the seeded fleet — real VINs and
-- engine numbers must replace these via /admin/cars before this data is
-- used on a real rental agreement (they're legally load-bearing fields on
-- the affidavit). Format is deliberately obviously-fake, not a guessed
-- real VIN pattern.
UPDATE cars SET
    chassis_number = 'CHASSIS-PENDING-' || registration_number,
    engine_number = 'ENGINE-PENDING-' || registration_number
WHERE chassis_number IS NULL;

ALTER TABLE bookings ADD COLUMN payment_method VARCHAR(10) NOT NULL DEFAULT 'ONLINE';

CREATE TABLE rental_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
    full_name VARCHAR(120) NOT NULL,
    guardian_relation VARCHAR(120),
    guardian_name VARCHAR(120),
    resident_address VARCHAR(300) NOT NULL,
    driving_license_number VARCHAR(40) NOT NULL,
    university_registration_number VARCHAR(40),
    id_proof_type VARCHAR(20) NOT NULL,
    id_proof_number VARCHAR(40) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    vehicle_label VARCHAR(120) NOT NULL,
    registration_number VARCHAR(30),
    chassis_number VARCHAR(40),
    engine_number VARCHAR(40),
    km_per_day_limit INT NOT NULL,
    rent_per_day NUMERIC(10,2) NOT NULL,
    agreed_to_terms BOOLEAN NOT NULL DEFAULT false,
    agreed_at TIMESTAMPTZ,
    agreed_from_ip VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
