export interface Addon {
  id: string;
  name: string;
  description: string | null;
  price: number;
  pricingType: "FLAT" | "PER_DAY";
}

export interface LocationOption {
  id: string;
  city: string;
  branchName: string;
  address: string;
}

export interface BookingAddonLine {
  name: string;
  price: number;
}

export interface Booking {
  id: string;
  bookingReference: string;
  status: string;
  carId: string;
  carBrand: string;
  carModel: string;
  carVariant: string;
  carImageUrl: string;
  pickupLocationName: string;
  returnLocationName: string;
  pickupAt: string;
  returnAt: string;
  durationDays: number;
  durationHours: number;
  rentalAmount: number;
  addonsAmount: number;
  taxAmount: number;
  discountAmount: number;
  securityDepositAmount: number;
  totalPayable: number;
  paymentMethod: "ONLINE" | "COD";
  addons: BookingAddonLine[];
}

export function formatDuration(days: number, hours: number): string {
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} Day${days === 1 ? "" : "s"}`);
  if (hours > 0) parts.push(`${hours} Hour${hours === 1 ? "" : "s"}`);
  return parts.join(" ") || "0 Hours";
}

export interface BookingCreateInput {
  carId: string;
  pickupLocationId: string;
  returnLocationId: string;
  pickupAt: string;
  returnAt: string;
  addonIds: string[];
  couponCode?: string;
  paymentMethod: "ONLINE" | "COD";
  onBehalfOfUserId?: string;
}
