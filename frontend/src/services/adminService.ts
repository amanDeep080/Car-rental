import axios from "axios";
import { api } from "@/lib/api";

export interface AdminDashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  totalBookings: number;
  todayBookings: number;
  activeRentals: number;
  availableCars: number;
  maintenanceCars: number;
  totalCustomers: number;
  pendingVerifications: number;
  pendingInspections: number;
  cancellationRatePercent: number;
  weekRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  completedRentals: number;
  cancelledBookings: number;
  totalCars: number;
  currentlyBookedCars: number;
}

export interface AdminBookingSummary {
  id: string;
  bookingReference: string;
  status: string;
  customerName: string;
  customerEmail: string;
  carLabel: string;
  pickupAt: string;
  returnAt: string;
  durationDays: number;
  durationHours: number;
  totalPayable: number;
}

export interface AdminCustomerSummary {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  active: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastSeenAt: string | null;
  totalBookings: number;
}

export interface AdminCustomerUpsertInput {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  dateOfBirth?: string;
  emailVerified: boolean;
  active: boolean;
}

export interface AdminDocument {
  id: string;
  documentType: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  url?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userPhone: string | null;
}

export interface AdminLocation {
  id: string;
  city: string;
  branchName: string;
  address: string;
  contactNumber: string | null;
  openingHours: string | null;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
}

export interface AdminLocationUpsertInput {
  city: string;
  branchName: string;
  address: string;
  contactNumber?: string | null;
  openingHours?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  active: boolean;
}

export interface AdminCarUpsertInput {
  slug: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  registrationNumber: string;
  category: string;
  fuel: string;
  transmission: string;
  seats: number;
  doors?: number;
  engine?: string;
  power?: string;
  mileagePolicy?: string;
  pricePerDay?: number;
  pricePerSixHours?: number;
  pricePerTwelveHours?: number;
  pricePerTwentyFourHours?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  securityDeposit?: number;
  locationId: string;
  status?: string;
  description?: string;
  rentalPolicy?: string;
  features?: string[];
  imageUrls?: string[];
}

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const { data } = await api.get<AdminDashboardStats>("/admin/dashboard");
  return data;
}

export async function getAdminCars() {
  const { data } = await api.get("/admin/cars");
  return data;
}

export async function createCar(input: AdminCarUpsertInput) {
  const { data } = await api.post("/admin/cars", input);
  return data;
}

export async function updateCar(id: string, input: AdminCarUpsertInput) {
  const { data } = await api.put(`/admin/cars/${id}`, input);
  return data;
}

export async function deactivateCar(id: string) {
  await api.post(`/admin/cars/${id}/deactivate`);
}

export async function deleteCar(id: string) {
  await api.delete(`/admin/cars/${id}`);
}

export async function uploadCarImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<{ url: string }>("/admin/cars/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data.url;
}

export async function getAdminBookings(params?: { status?: string; customerEmail?: string }): Promise<AdminBookingSummary[]> {
  const { data } = await api.get<AdminBookingSummary[]>("/admin/bookings", { params });
  return data;
}

export interface AdminBookingDetail {
  id: string;
  bookingReference: string;
  status: string;
  customer: { id: string; fullName: string; email: string; phone: string };
  car: { id: string; brand: string; model: string; variant: string; registrationNumber: string | null };
  pickupAt: string;
  returnAt: string;
  durationDays: number;
  durationHours: number;
  rentalAmount: number;
  totalPayable: number;
  paymentMethod: string;
  agreement: {
    fullName: string;
    guardianRelation: string;
    guardianName: string;
    residentAddress: string;
    drivingLicenseNumber: string;
    universityRegistrationNumber: string | null;
    idProofType: string;
    idProofNumber: string;
    mobileNumber: string;
    kmPerDayLimit: number;
    rentPerDay: number;
  } | null;
  history: Array<{ fromStatus: string; toStatus: string; changedBy: string; note: string | null; createdAt: string }>;
}

export async function getAdminBookingDetail(id: string): Promise<AdminBookingDetail> {
  const { data } = await api.get<AdminBookingDetail>(`/admin/bookings/${id}`);
  return data;
}

export async function confirmBooking(id: string) {
  await api.post(`/admin/bookings/${id}/confirm`);
}

export async function cancelAdminBooking(id: string, reason?: string) {
  await api.post(`/admin/bookings/${id}/cancel`, { reason });
}

export async function markPickup(id: string) {
  await api.post(`/admin/bookings/${id}/pickup`);
}

export async function markReturn(id: string) {
  await api.post(`/admin/bookings/${id}/return`);
}

export async function markComplete(id: string) {
  await api.post(`/admin/bookings/${id}/complete`);
}

export async function getAdminCustomers(): Promise<AdminCustomerSummary[]> {
  const { data } = await api.get<AdminCustomerSummary[]>("/admin/customers");
  return data;
}

export async function getAdminLocations(): Promise<AdminLocation[]> {
  const { data } = await api.get<AdminLocation[]>("/admin/locations");
  return data;
}

export async function createLocation(input: AdminLocationUpsertInput): Promise<AdminLocation> {
  const { data } = await api.post<AdminLocation>("/admin/locations", input);
  return data;
}

export async function updateLocation(id: string, input: AdminLocationUpsertInput): Promise<AdminLocation> {
  const { data } = await api.put<AdminLocation>(`/admin/locations/${id}`, input);
  return data;
}

export async function deleteLocation(id: string): Promise<void> {
  await api.delete(`/admin/locations/${id}`);
}

export async function createCustomer(input: AdminCustomerUpsertInput): Promise<AdminCustomerSummary> {
  const { data } = await api.post<AdminCustomerSummary>("/admin/customers", input);
  return data;
}

export async function updateCustomer(id: string, input: AdminCustomerUpsertInput): Promise<AdminCustomerSummary> {
  const { data } = await api.put<AdminCustomerSummary>(`/admin/customers/${id}`, input);
  return data;
}

export async function blockCustomer(id: string) {
  await api.post(`/admin/customers/${id}/block`);
}

export async function unblockCustomer(id: string) {
  await api.post(`/admin/customers/${id}/unblock`);
}

export async function getCustomerDetail(id: string): Promise<AdminCustomerSummary> {
  const { data } = await api.get<AdminCustomerSummary>(`/admin/customers/${id}`);
  return data;
}

export async function getCustomerDocuments(id: string): Promise<AdminDocument[]> {
  const { data } = await api.get<AdminDocument[]>(`/admin/customers/${id}/documents`);
  return data;
}

export async function getPendingDocuments(): Promise<AdminDocument[]> {
  const { data } = await api.get<AdminDocument[]>("/admin/documents/pending");
  return data;
}

export async function approveDocument(id: string) {
  await api.post(`/admin/documents/${id}/approve`);
}

export async function rejectDocument(id: string, reason: string) {
  await api.post(`/admin/documents/${id}/reject`, { reason });
}

export interface RevenuePoint {
  period: string;
  revenue: number;
  bookingCount: number;
}

export interface TopCar {
  carId: string;
  label: string;
  bookingCount: number;
  revenue: number;
}

export interface TopLocation {
  city: string;
  bookingCount: number;
}

export interface AnalyticsOverview {
  revenueByMonth: RevenuePoint[];
  topCars: TopCar[];
  topLocations: TopLocation[];
  newCustomersLast30Days: number;
  repeatCustomers: number;
  fleetUtilizationPercent: number;
}

export interface AnalyticsData {
  from: string;
  to: string;
  revenue: number;
  bookings: number;
  activeRentals: number;
  completedRentals: number;
  cancelledBookings: number;
  totalCars: number;
  availableCars: number;
  currentlyBookedCars: number;
  averageBookingValue: number;
  totalRentalHours: number;
  averageRentalHours: number;
  monthlyRevenue: RevenuePoint[];
  dailyRevenue: RevenuePoint[];
  weeklyRevenue: RevenuePoint[];
  bookingTrend: Array<{ period: string; bookingCount: number }>;
  bookingStatuses: Array<{ status: string; count: number }>;
  durationBuckets: Array<{ status: string; count: number }>;
  pickupTimes: Array<{ status: string; count: number }>;
  carPerformance: Array<{ carId: string; label: string; bookingCount: number; rentalHours: number; revenue: number }>;
  utilization: Array<{ carId: string; label: string; bookingCount: number; rentalHours: number; revenue: number }>;
  previousPeriodRevenue: number;
  peaks: { pickupDay: string; pickupTime: string; busiestMonth: string };
}

export async function getAnalyticsData(from?: string, to?: string): Promise<AnalyticsData> {
  const { data } = await api.get<AnalyticsData>("/admin/analytics/data", { params: { from, to } });
  return data;
}

export interface BookingReportRow {
  bookingId: string;
  customer: string;
  car: string;
  pickupAt: string;
  returnAt: string;
  durationDays: number;
  durationHours: number;
  status: string;
  amount: number;
}

export async function getBookingReport(params: { from?: string; to?: string; status?: string; carId?: string }): Promise<BookingReportRow[]> {
  const { data } = await api.get<BookingReportRow[]>("/admin/analytics/report", { params });
  return data;
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const { data } = await api.get<AnalyticsOverview>("/admin/analytics/overview");
  return data;
}

export interface AdminCoupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minBookingAmount: number | null;
  maxDiscountAmount: number | null;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  userUsageLimit: number | null;
  active: boolean;
}

export interface CouponUpsertInput {
  code: string;
  discountType: string;
  discountValue: number;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  userUsageLimit?: number;
  active: boolean;
}

export async function getAdminCoupons(): Promise<AdminCoupon[]> {
  const { data } = await api.get<AdminCoupon[]>("/admin/coupons");
  return data;
}

export async function createCoupon(input: CouponUpsertInput): Promise<AdminCoupon> {
  const { data } = await api.post<AdminCoupon>("/admin/coupons", input);
  return data;
}

export async function deactivateCoupon(id: string): Promise<void> {
  await api.post(`/admin/coupons/${id}/deactivate`);
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  metadata: string | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

export async function getRecentActivity(page = 0, size = 10): Promise<PaginatedResponse<AuditLogEntry>> {
  const { data } = await api.get<PaginatedResponse<AuditLogEntry>>("/admin/audit-logs", { params: { page, size } });
  return data;
}
