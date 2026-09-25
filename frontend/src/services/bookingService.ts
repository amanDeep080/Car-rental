import { api } from "@/lib/api";
import type { Addon, Booking, BookingCreateInput, LocationOption } from "@/types/booking";

// Fallback demo data so the wizard is explorable before the backend is deployed.
const DEMO_ADDONS: Addon[] = [
  { id: "a1", name: "Zero Depreciation Insurance", description: "Full protection cover — no deduction for depreciation on repair claims.", price: 499, pricingType: "PER_DAY" },
  { id: "a2", name: "Extra Mileage Pack", description: "Add 100 km/day to your included mileage.", price: 299, pricingType: "PER_DAY" },
  { id: "a3", name: "Child Seat", description: "Forward-facing child safety seat, fitted at pickup.", price: 199, pricingType: "FLAT" },
  { id: "a4", name: "GPS Navigator", description: "Dedicated GPS unit with offline maps.", price: 149, pricingType: "FLAT" },
];

const DEMO_LOCATIONS: LocationOption[] = [
  { id: "l1", city: "Phagwara", branchName: "Velocira Phagwara Hub", address: "GT Road, Near Bus Stand, Phagwara, Punjab" },
  { id: "l2", city: "Jalandhar", branchName: "Velocira Jalandhar Branch", address: "Model Town, Jalandhar, Punjab" },
];

export async function getAddons(): Promise<Addon[]> {
  try {
    const { data } = await api.get<Addon[]>("/addons");
    return data;
  } catch {
    return DEMO_ADDONS;
  }
}

export async function getLocations(): Promise<LocationOption[]> {
  try {
    const { data } = await api.get<LocationOption[]>("/locations");
    return data;
  } catch {
    return DEMO_LOCATIONS;
  }
}

export async function createBooking(input: BookingCreateInput): Promise<Booking> {
  const { data } = await api.post<Booking>("/bookings", input);
  return data;
}

export async function getMyBookings(): Promise<Booking[]> {
  const { data } = await api.get<Booking[]>("/bookings");
  return data;
}

export async function getBookingByReference(reference: string): Promise<Booking> {
  const { data } = await api.get<Booking>(`/bookings/${reference}`);
  return data;
}

export async function cancelBooking(reference: string): Promise<void> {
  await api.post(`/bookings/${reference}/cancel`);
}
