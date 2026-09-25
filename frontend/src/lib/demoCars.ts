import type { CarDetail, CarSummary } from "@/types/car";

// Mirrors backend/src/main/resources/db/migration/V2__seed_demo_data.sql
// Used only as a fallback when the API is unreachable — see carService.ts.
// Image paths are placeholders; drop real photos into
// frontend/public/images/cars/ using these filenames.

export const DEMO_CARS: CarSummary[] = [
  { id: "1", slug: "maruti-swift", brand: "Maruti Suzuki", model: "Swift", variant: "ZXI", year: 2024, category: "Hatchback", imageUrl: "/images/cars/maruti-swift.jpg", rating: 4.6, reviewCount: 142, pricePerDay: 2000, currency: "INR", transmission: "AUTOMATIC", fuel: "PETROL", seats: 5, location: "Phagwara", status: "AVAILABLE" },
  { id: "2", slug: "kia-sonet", brand: "Kia", model: "Sonet", variant: "HTX", year: 2024, category: "Compact SUV", imageUrl: "/images/cars/kia-sonet.jpg", rating: 4.7, reviewCount: 98, pricePerDay: 2300, currency: "INR", transmission: "MANUAL", fuel: "PETROL", seats: 5, location: "Phagwara", status: "AVAILABLE" },
  { id: "3", slug: "maruti-fronx", brand: "Maruti Suzuki", model: "Fronx", variant: "Alpha", year: 2024, category: "Crossover", imageUrl: "/images/cars/maruti-fronx.jpg", rating: 4.5, reviewCount: 61, pricePerDay: 2100, currency: "INR", transmission: "MANUAL", fuel: "PETROL", seats: 5, location: "Jalandhar", status: "AVAILABLE" },
  { id: "4", slug: "hyundai-i20", brand: "Hyundai", model: "i20", variant: "Sportz", year: 2023, category: "Hatchback", imageUrl: "/images/cars/hyundai-i20.jpg", rating: 4.4, reviewCount: 177, pricePerDay: 2100, currency: "INR", transmission: "MANUAL", fuel: "PETROL", seats: 5, location: "Jalandhar", status: "AVAILABLE" },
  { id: "5", slug: "mahindra-xuv300", brand: "Mahindra", model: "XUV300", variant: "W8", year: 2023, category: "Compact SUV", imageUrl: "/images/cars/mahindra-xuv300.jpg", rating: 4.6, reviewCount: 84, pricePerDay: 2300, currency: "INR", transmission: "MANUAL", fuel: "PETROL", seats: 5, location: "Phagwara", status: "AVAILABLE" },
  { id: "6", slug: "hyundai-creta", brand: "Hyundai", model: "Creta", variant: "SX", year: 2024, category: "Mid SUV", imageUrl: "/images/cars/hyundai-creta.jpg", rating: 4.9, reviewCount: 231, pricePerDay: 2400, currency: "INR", transmission: "MANUAL", fuel: "PETROL", seats: 5, location: "Chandigarh", status: "AVAILABLE" },
  { id: "7", slug: "hyundai-venue", brand: "Hyundai", model: "Venue", variant: "SX(O)", year: 2023, category: "Compact SUV", imageUrl: "/images/cars/hyundai-venue.jpg", rating: 4.5, reviewCount: 76, pricePerDay: 2500, currency: "INR", transmission: "MANUAL", fuel: "PETROL", seats: 5, location: "Chandigarh", status: "AVAILABLE" },
  { id: "8", slug: "vw-vento", brand: "Volkswagen", model: "Vento", variant: "Highline", year: 2022, category: "Sedan", imageUrl: "/images/cars/vw-vento.jpg", rating: 4.3, reviewCount: 52, pricePerDay: 2500, currency: "INR", transmission: "AUTOMATIC", fuel: "DIESEL", seats: 5, location: "Delhi", status: "AVAILABLE" },
  { id: "9", slug: "mahindra-thar-rwd", brand: "Mahindra", model: "Thar", variant: "RWD LX", year: 2024, category: "Off-Roader", imageUrl: "/images/cars/mahindra-thar-rwd.jpg", rating: 4.8, reviewCount: 163, pricePerDay: 3400, currency: "INR", transmission: "MANUAL", fuel: "DIESEL", seats: 4, location: "Phagwara", status: "AVAILABLE" },
  { id: "10", slug: "mahindra-thar-4x4", brand: "Mahindra", model: "Thar", variant: "4x4 AX(O)", year: 2024, category: "Off-Roader", imageUrl: "/images/cars/mahindra-thar-4x4.jpg", rating: 4.9, reviewCount: 121, pricePerDay: 3600, currency: "INR", transmission: "AUTOMATIC", fuel: "DIESEL", seats: 4, location: "Jalandhar", status: "AVAILABLE" },
  { id: "11", slug: "mahindra-thar-roxx", brand: "Mahindra", model: "Thar Roxx", variant: "AX7L 4x4", year: 2024, category: "Off-Roader", imageUrl: "/images/cars/mahindra-thar-roxx.jpg", rating: 4.9, reviewCount: 47, pricePerDay: 3800, currency: "INR", transmission: "AUTOMATIC", fuel: "DIESEL", seats: 5, location: "Chandigarh", status: "MAINTENANCE" },
  { id: "12", slug: "kia-carens", brand: "Kia", model: "Carens", variant: "Luxury Plus", year: 2024, category: "MPV", imageUrl: "/images/cars/kia-carens.jpg", rating: 4.6, reviewCount: 68, pricePerDay: 3400, currency: "INR", transmission: "MANUAL", fuel: "PETROL", seats: 6, location: "Delhi", status: "AVAILABLE" },
  { id: "13", slug: "mahindra-scorpio-s11", brand: "Mahindra", model: "Scorpio", variant: "S11", year: 2023, category: "Mid SUV", imageUrl: "/images/cars/mahindra-scorpio-s11.jpg", rating: 4.5, reviewCount: 94, pricePerDay: 3800, currency: "INR", transmission: "MANUAL", fuel: "DIESEL", seats: 7, location: "Phagwara", status: "AVAILABLE" },
  { id: "14", slug: "mahindra-scorpio-n", brand: "Mahindra", model: "Scorpio-N", variant: "Z8L", year: 2024, category: "Full-Size SUV", imageUrl: "/images/cars/mahindra-scorpio-n.jpg", rating: 4.8, reviewCount: 112, pricePerDay: 3999, currency: "INR", transmission: "AUTOMATIC", fuel: "DIESEL", seats: 7, location: "Jalandhar", status: "AVAILABLE" },
  { id: "15", slug: "toyota-innova-crysta", brand: "Toyota", model: "Innova Crysta", variant: "ZX", year: 2023, category: "MPV", imageUrl: "/images/cars/toyota-innova-crysta.jpg", rating: 4.9, reviewCount: 205, pricePerDay: 4200, currency: "INR", transmission: "MANUAL", fuel: "DIESEL", seats: 7, location: "Chandigarh", status: "AVAILABLE" },
];

export const DEMO_CAR_DETAILS: Record<string, CarDetail> = Object.fromEntries(
  DEMO_CARS.map((c) => [
    c.slug,
    {
      id: c.id,
      slug: c.slug,
      brand: c.brand,
      model: c.model,
      variant: c.variant,
      year: c.year,
      category: c.category,
      fuel: c.fuel,
      transmission: c.transmission,
      seats: c.seats,
      doors: 4,
      engine: null,
      power: null,
      mileagePolicy: "200 km/day included, extra km billed at pickup",
      pricePerSixHours: Math.round(c.pricePerDay * 0.45),
      pricePerTwelveHours: Math.round(c.pricePerDay * 0.65),
      pricePerTwentyFourHours: c.pricePerDay,
      pricePerDay: c.pricePerDay,
      pricePerWeek: Math.round(c.pricePerDay * 6.2),
      pricePerMonth: Math.round(c.pricePerDay * 21),
      securityDeposit: Math.round(c.pricePerDay * 2.5),
      locationId: c.id,
      locationCity: c.location,
      status: c.status,
      description: `${c.brand} ${c.model} ${c.variant} — a well-maintained ${c.category.toLowerCase()} ready for self-drive.`,
      rentalPolicy: "Minimum age 21, valid driving license required, fuel returned at the same level as pickup.",
      features: ["Air Conditioning", "Bluetooth", "USB Charging"],
      imageUrls: [c.imageUrl],
      rating: c.rating,
      reviewCount: c.reviewCount,
    },
  ])
);
