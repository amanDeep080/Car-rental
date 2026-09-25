import { api } from "@/lib/api";

export interface AgreementSubmitInput {
  fullName: string;
  guardianRelation: string;
  guardianName: string;
  residentAddress: string;
  drivingLicenseNumber: string;
  universityRegistrationNumber?: string;
  idProofType: string;
  idProofNumber: string;
  mobileNumber: string;
  kmPerDayLimit: number;
  agreedToTerms: boolean;
}

export interface AgreementResponse {
  id: string;
  fullName: string;
  vehicleLabel: string;
  registrationNumber: string | null;
  kmPerDayLimit: number;
  rentPerDay: number;
  agreedToTerms: boolean;
  agreedAt: string | null;
}

export async function submitAgreement(bookingReference: string, input: AgreementSubmitInput): Promise<AgreementResponse> {
  const { data } = await api.post<AgreementResponse>(`/bookings/${bookingReference}/agreement`, input);
  return data;
}
