import { api } from "@/lib/api";
import { mapCarSummaryDto, type CarDetail, type CarSummary, type CarSummaryDto } from "@/types/car";
import { DEMO_CARS, DEMO_CAR_DETAILS } from "@/lib/demoCars";

export interface CarSearchParams {
  location?: string;
  pickupAt?: string;
  returnAt?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  transmission?: string;
  fuel?: string;
  minSeats?: number;
  sort?: string;
}

export async function searchCars(params: CarSearchParams): Promise<CarSummary[]> {
  try {
    const { data } = await api.get<CarSummaryDto[]>("/cars", { params });
    return data.map(mapCarSummaryDto);
  } catch {
    // Backend not reachable (e.g. local frontend-only preview) — fall back
    // to demo data so the UI remains explorable. Remove this fallback once
    // the backend is deployed and always reachable from this environment.
    return DEMO_CARS;
  }
}

export async function getCarBySlug(slug: string): Promise<CarDetail | null> {
  try {
    const { data } = await api.get<CarDetail>(`/cars/${slug}`);
    return data;
  } catch {
    return DEMO_CAR_DETAILS[slug] ?? null;
  }
}
