export type FuelType = "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID";
export type Transmission = "MANUAL" | "AUTOMATIC";
export type CarStatus = "AVAILABLE" | "BOOKED" | "MAINTENANCE" | "INACTIVE";

export interface CarSummary {
  id: string;
  slug: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  category: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  pricePerDay: number;
  currency: string;
  transmission: Transmission;
  fuel: FuelType;
  seats: number;
  location: string;
  status: CarStatus;
}

// Shape returned by GET /api/cars — mapped into CarSummary by mapCarSummaryDto
// below so the rest of the frontend works with one consistent type regardless
// of minor backend field-naming differences.
export interface CarSummaryDto {
  id: string;
  slug: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  category: string;
  primaryImageUrl: string;
  rating: number;
  reviewCount: number;
  pricePerDay: number;
  transmission: Transmission;
  fuel: FuelType;
  seats: number;
  locationCity: string;
  status: CarStatus;
}

export function mapCarSummaryDto(dto: CarSummaryDto): CarSummary {
  return {
    id: dto.id,
    slug: dto.slug,
    brand: dto.brand,
    model: dto.model,
    variant: dto.variant,
    year: dto.year,
    category: dto.category,
    imageUrl: dto.primaryImageUrl,
    rating: dto.rating,
    reviewCount: dto.reviewCount,
    pricePerDay: dto.pricePerDay,
    currency: "INR",
    transmission: dto.transmission,
    fuel: dto.fuel,
    seats: dto.seats,
    location: dto.locationCity,
    status: dto.status,
  };
}

export interface CarDetail {
  id: string;
  slug: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  category: string;
  fuel: FuelType;
  transmission: Transmission;
  seats: number;
  doors: number | null;
  engine: string | null;
  power: string | null;
  mileagePolicy: string | null;
  pricePerSixHours: number | null;
  pricePerTwelveHours: number | null;
  pricePerTwentyFourHours: number | null;
  pricePerDay: number;
  pricePerWeek: number | null;
  pricePerMonth: number | null;
  securityDeposit: number;
  locationId: string;
  locationCity: string;
  status: CarStatus;
  description: string | null;
  rentalPolicy: string | null;
  features: string[];
  imageUrls: string[];
  rating: number;
  reviewCount: number;
  currentlyBooked?: boolean;
  bookedUntil?: string | null;
}

