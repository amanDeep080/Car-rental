-- V2__seed_demo_data.sql
-- Wheels On Rentals fleet and pricing, transcribed from the business's own
-- promotional flyer. Registration numbers are placeholders (format
-- PB08-WOR-00xx) pending real registration data; branch addresses are
-- marked "to be confirmed" since only phone numbers were on the source
-- flyer, not street addresses.

INSERT INTO locations (id, city, branch_name, address, latitude, longitude, contact_number, opening_hours, active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Phagwara', 'Wheels On Rentals — Phagwara Hub', 'Phagwara, Punjab — exact address to be confirmed', 31.2240, 75.7708, '+919149089571', '07:00–22:00', true),
    ('11111111-1111-1111-1111-111111111112', 'Jalandhar', 'Wheels On Rentals — Jalandhar Branch', 'Jalandhar, Punjab — exact address to be confirmed', 31.3260, 75.5762, '+919755975765', '07:00–22:00', true),
    ('11111111-1111-1111-1111-111111111113', 'Chandigarh', 'Wheels On Rentals — Chandigarh Branch', 'Chandigarh — exact address to be confirmed', 30.7333, 76.7794, '+919671223901', '06:00–23:00', true),
    ('11111111-1111-1111-1111-111111111114', 'Delhi', 'Wheels On Rentals — Delhi Branch', 'New Delhi — exact address to be confirmed', 28.6315, 77.2167, '+916230192122', '06:00–23:00', true);

-- brand, model, variant, year, category, fuel, transmission, seats, price/day, price/6h, price/12h, price/24h, deposit
INSERT INTO cars (id, slug, brand, model, variant, year, registration_number, category, fuel, transmission, seats, doors,
    engine, power, mileage_policy, price_per_day, price_per_six_hours, price_per_twelve_hours, price_per_twenty_four_hours,
    price_per_week, price_per_month, security_deposit, location_id, status, description, rental_policy) VALUES

    (gen_random_uuid(), 'maruti-swift', 'Maruti Suzuki', 'Swift', 'ZXI', 2024, 'PB08-WOR-0001', 'Hatchback', 'PETROL', 'AUTOMATIC', 5, 4,
     '1.2L K-Series', '89 bhp', '200 km/day included, ₹10/km after', 2000, 800, 1200, 2000, 12000, 42000, 5000,
     '11111111-1111-1111-1111-111111111111', 'AVAILABLE', 'Compact, easy to park, and efficient for city runs.', 'Standard rental terms apply.'),

    (gen_random_uuid(), 'kia-sonet', 'Kia', 'Sonet', 'HTX', 2024, 'PB08-WOR-0002', 'Compact SUV', 'PETROL', 'MANUAL', 5, 4,
     '1.0L Turbo GDi', '118 bhp', '200 km/day included, ₹12/km after', 2300, 900, 1300, 2300, 14000, 48000, 6000,
     '11111111-1111-1111-1111-111111111111', 'AVAILABLE', 'Punchy turbo-petrol SUV with a premium cabin.', 'Standard rental terms apply.'),

    (gen_random_uuid(), 'maruti-fronx', 'Maruti Suzuki', 'Fronx', 'Alpha', 2024, 'PB08-WOR-0003', 'Crossover', 'PETROL', 'MANUAL', 5, 4,
     '1.0L Boosterjet', '99 bhp', '200 km/day included, ₹10/km after', 2100, 900, 1200, 2100, 13000, 44000, 5500,
     '11111111-1111-1111-1111-111111111112', 'AVAILABLE', 'Sharp-looking crossover with strong fuel efficiency.', 'Standard rental terms apply.'),

    (gen_random_uuid(), 'hyundai-i20', 'Hyundai', 'i20', 'Sportz', 2023, 'PB08-WOR-0004', 'Hatchback', 'PETROL', 'MANUAL', 5, 4,
     '1.2L Kappa', '82 bhp', '200 km/day included, ₹10/km after', 2100, 900, 1200, 2100, 13000, 44000, 5000,
     '11111111-1111-1111-1111-111111111112', 'AVAILABLE', 'A comfortable, well-equipped hatchback for everyday trips.', 'Standard rental terms apply.'),

    (gen_random_uuid(), 'mahindra-xuv300', 'Mahindra', 'XUV300', 'W8', 2023, 'PB08-WOR-0005', 'Compact SUV', 'PETROL', 'MANUAL', 5, 4,
     '1.2L Turbo', '110 bhp', '200 km/day included, ₹12/km after', 2300, 1900, 1300, 2300, 14000, 48000, 6000,
     '11111111-1111-1111-1111-111111111111', 'AVAILABLE', 'Solid build quality with a strong safety rating.', 'Standard rental terms apply.'),

    (gen_random_uuid(), 'hyundai-creta', 'Hyundai', 'Creta', 'SX', 2024, 'PB08-WOR-0006', 'Mid SUV', 'PETROL', 'MANUAL', 5, 4,
     '1.5L MPi', '113 bhp', '200 km/day included, ₹14/km after', 2400, 1000, 1400, 2400, 15000, 52000, 7000,
     '11111111-1111-1111-1111-111111111113', 'AVAILABLE', 'India''s benchmark mid-size SUV — spacious and refined.', 'Standard rental terms apply.'),

    (gen_random_uuid(), 'hyundai-venue', 'Hyundai', 'Venue', 'SX(O)', 2023, 'PB08-WOR-0007', 'Compact SUV', 'PETROL', 'MANUAL', 5, 4,
     '1.0L Turbo', '118 bhp', '200 km/day included, ₹12/km after', 2500, 1000, 1400, 2500, 15500, 53000, 6500,
     '11111111-1111-1111-1111-111111111113', 'AVAILABLE', 'Feature-loaded compact SUV, great for weekend trips.', 'Standard rental terms apply.'),

    (gen_random_uuid(), 'vw-vento', 'Volkswagen', 'Vento', 'Highline', 2022, 'PB08-WOR-0008', 'Sedan', 'DIESEL', 'AUTOMATIC', 5, 4,
     '1.5L TDI', '108 bhp', '200 km/day included, ₹12/km after', 2500, 1000, 1600, 2500, 15500, 53000, 7000,
     '11111111-1111-1111-1111-111111111114', 'AVAILABLE', 'German-engineered sedan with a planted highway ride.', 'Standard rental terms apply.'),

    (gen_random_uuid(), 'mahindra-thar-rwd', 'Mahindra', 'Thar', 'RWD LX', 2024, 'PB08-WOR-0009', 'Off-Roader', 'DIESEL', 'MANUAL', 4, 3,
     '2.2L mHawk', '130 bhp', '150 km/day included, ₹15/km after', 3400, 1300, 2200, 3400, 21000, 72000, 10000,
     '11111111-1111-1111-1111-111111111111', 'AVAILABLE', 'Convertible off-roader — pure adventure.', 'Standard rental terms apply.'),

    (gen_random_uuid(), 'mahindra-thar-4x4', 'Mahindra', 'Thar', '4x4 AX(O)', 2024, 'PB08-WOR-0010', 'Off-Roader', 'DIESEL', 'AUTOMATIC', 4, 3,
     '2.2L mHawk 4WD', '130 bhp', '150 km/day included, ₹15/km after', 3600, 1300, 2300, 3600, 22000, 75000, 12000,
     '11111111-1111-1111-1111-111111111112', 'AVAILABLE', 'True 4x4 capability for hills and trails.', 'Standard rental terms apply.'),

    (gen_random_uuid(), 'mahindra-thar-roxx', 'Mahindra', 'Thar Roxx', 'AX7L 4x4', 2024, 'PB08-WOR-0011', 'Off-Roader', 'DIESEL', 'AUTOMATIC', 5, 4,
     '2.2L mHawk 4WD', '170 bhp', '150 km/day included, ₹16/km after', 3800, 1500, 2500, 3800, 23500, 80000, 12000,
     '11111111-1111-1111-1111-111111111113', 'MAINTENANCE', 'The 5-door Thar — more space, same attitude.', 'Standard rental terms apply.'),

    (gen_random_uuid(), 'kia-carens', 'Kia', 'Carens', 'Luxury Plus', 2024, 'PB08-WOR-0012', 'MPV', 'PETROL', 'MANUAL', 6, 5,
     '1.5L MPi', '113 bhp', '200 km/day included, ₹13/km after', 3400, 1500, 2500, 3400, 21000, 72000, 8000,
     '11111111-1111-1111-1111-111111111114', 'AVAILABLE', 'Three-row comfort for family road trips.', 'Standard rental terms apply.'),

    (gen_random_uuid(), 'mahindra-scorpio-s11', 'Mahindra', 'Scorpio', 'S11', 2023, 'PB08-WOR-0013', 'Mid SUV', 'DIESEL', 'MANUAL', 7, 4,
     '2.2L mHawk', '132 bhp', '200 km/day included, ₹14/km after', 3800, 1500, 2500, 3800, 23500, 80000, 9000,
     '11111111-1111-1111-1111-111111111111', 'AVAILABLE', 'Rugged body-on-frame SUV with three-row seating.', 'Standard rental terms apply.'),

    (gen_random_uuid(), 'mahindra-scorpio-n', 'Mahindra', 'Scorpio-N', 'Z8L', 2024, 'PB08-WOR-0014', 'Full-Size SUV', 'DIESEL', 'AUTOMATIC', 7, 4,
     '2.2L mHawk', '172 bhp', '200 km/day included, ₹16/km after', 3999, 1500, 2600, 3999, 25000, 85000, 12000,
     '11111111-1111-1111-1111-111111111112', 'AVAILABLE', 'Flagship SUV — commanding presence, effortless power.', 'Standard rental terms apply.'),

    (gen_random_uuid(), 'toyota-innova-crysta', 'Toyota', 'Innova Crysta', 'ZX', 2023, 'PB08-WOR-0015', 'MPV', 'DIESEL', 'MANUAL', 7, 5,
     '2.4L D-4D', '148 bhp', '200 km/day included, ₹14/km after', 4200, 1700, 2600, 4200, 26000, 88000, 10000,
     '11111111-1111-1111-1111-111111111113', 'AVAILABLE', 'The dependable choice for long-distance family travel.', 'Standard rental terms apply.');

-- Sample features (subset — enough to exercise the "only show configured features" rule, spec §17)
INSERT INTO car_features (car_id, feature)
SELECT id, unnest(ARRAY['Air Conditioning', 'Bluetooth', 'USB Charging'])
FROM cars WHERE slug = 'maruti-swift';

-- Flyer marks these four models "@Automatic & manual available" — our
-- schema models one transmission per specific listing, so this is
-- represented as a feature tag rather than a duplicate listing. An admin
-- can add a second manual-transmission listing for these models via
-- /admin/cars if separate bookable units are wanted.
INSERT INTO car_features (car_id, feature)
SELECT id, 'Manual Transmission Also Available'
FROM cars WHERE slug IN ('maruti-swift', 'mahindra-thar-4x4', 'mahindra-thar-roxx', 'mahindra-scorpio-n');

INSERT INTO car_features (car_id, feature)
SELECT id, unnest(ARRAY['Air Conditioning', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Sunroof', 'Rear Camera'])
FROM cars WHERE slug = 'kia-sonet';

INSERT INTO car_features (car_id, feature)
SELECT id, unnest(ARRAY['Air Conditioning', 'Cruise Control', 'Parking Sensors', 'Rear Camera', 'GPS'])
FROM cars WHERE slug = 'hyundai-creta';

INSERT INTO car_features (car_id, feature)
SELECT id, unnest(ARRAY['Air Conditioning', '4x4 Drive Mode', 'Cruise Control', 'Touchscreen Infotainment'])
FROM cars WHERE slug = 'mahindra-thar-roxx';

INSERT INTO car_features (car_id, feature)
SELECT id, unnest(ARRAY['Air Conditioning', 'Captain Seats', 'Rear Camera', 'Cruise Control', '7 Seats'])
FROM cars WHERE slug = 'toyota-innova-crysta';
