"use client";

import { useEffect } from "react";
import { RENTAL_TERMS, AFFIDAVIT_INTRO } from "@/lib/rentalTerms";
import { Clock } from "lucide-react";

export interface AgreementDetails {
  fullName: string;
  guardianRelation: string;
  guardianName: string;
  residentAddress: string;
  drivingLicenseNumber: string;
  universityRegistrationNumber: string;
  idProofType: string;
  idProofNumber: string;
  mobileNumber: string;
  kmPerDayLimit: number;
  agreedToTerms: boolean;
}

export const DEFAULT_AGREEMENT: AgreementDetails = {
  fullName: "",
  guardianRelation: "son of",
  guardianName: "",
  residentAddress: "",
  drivingLicenseNumber: "",
  universityRegistrationNumber: "",
  idProofType: "AADHAAR",
  idProofNumber: "",
  mobileNumber: "",
  kmPerDayLimit: 300,
  agreedToTerms: false,
};

export default function StepAgreement({
  agreement,
  onChange,
  vehicleLabel,
  rentTotal,
  kmLimit,
  durationDays,
  durationHours,
}: {
  agreement: AgreementDetails;
  onChange: (a: AgreementDetails) => void;
  vehicleLabel: string;
  rentTotal: number;
  kmLimit: number;
  durationDays: number;
  durationHours: number;
}) {
  function update<K extends keyof AgreementDetails>(key: K, value: AgreementDetails[K]) {
    onChange({ ...agreement, [key]: value });
  }

  useEffect(() => {
    if (agreement.kmPerDayLimit !== kmLimit) {
      onChange({ ...agreement, kmPerDayLimit: kmLimit });
    }
  }, [kmLimit, agreement.kmPerDayLimit, onChange]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-600 text-ivory">Rental Agreement</h2>
        <p className="mt-1 text-sm text-steel">
          This is a legal declaration between you and Wheels On Rentals for the {vehicleLabel}.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-card border border-brass/20 bg-brass/5 p-4">
        <div className="flex items-center gap-2 text-brass">
          <Clock size={16} />
          <span className="text-xs font-600 uppercase tracking-wider">Booking Duration</span>
        </div>
        <span className="text-sm font-medium text-ivory">
          {durationDays > 0 ? `${durationDays} Day${durationDays > 1 ? 's' : ''}` : ''}
          {durationDays > 0 && durationHours > 0 ? ', ' : ''}
          {durationHours > 0 ? `${durationHours} Hour${durationHours > 1 ? 's' : ''}` : durationDays === 0 ? '0 Hours' : ''}
        </span>
      </div>

      <p className="rounded-card border border-graphite-line bg-graphite-raised/40 p-4 text-sm leading-relaxed text-steel">
        {AFFIDAVIT_INTRO}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name">
          <input required value={agreement.fullName} onChange={(e) => update("fullName", e.target.value)} className="input" />
        </Field>
        <Field label="Mobile Number">
          <input required value={agreement.mobileNumber} onChange={(e) => update("mobileNumber", e.target.value)} className="input" placeholder="+91 98765 43210" />
        </Field>

        <Field label="Relation">
          <select value={agreement.guardianRelation} onChange={(e) => update("guardianRelation", e.target.value)} className="input">
            <option value="son of" className="bg-graphite-raised">Son of</option>
            <option value="daughter of" className="bg-graphite-raised">Daughter of</option>
            <option value="wife of" className="bg-graphite-raised">Wife of</option>
          </select>
        </Field>
        <Field label="Father's / Husband's Name">
          <input required value={agreement.guardianName} onChange={(e) => update("guardianName", e.target.value)} className="input" />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Resident Address">
            <input required value={agreement.residentAddress} onChange={(e) => update("residentAddress", e.target.value)} className="input" />
          </Field>
        </div>

        <Field label="Driving License Number">
          <input required value={agreement.drivingLicenseNumber} onChange={(e) => update("drivingLicenseNumber", e.target.value)} className="input" />
        </Field>
        <Field label="LPU Registration Number">
          <input required value={agreement.universityRegistrationNumber} onChange={(e) => update("universityRegistrationNumber", e.target.value)} className="input" />
        </Field>

        <Field label="ID Proof Type">
          <select value={agreement.idProofType} onChange={(e) => update("idProofType", e.target.value)} className="input">
            <option value="AADHAAR" className="bg-graphite-raised">Aadhaar Card</option>
            <option value="PAN" className="bg-graphite-raised">PAN Card</option>
            <option value="PASSPORT" className="bg-graphite-raised">Passport (NRI)</option>
          </select>
        </Field>
        <Field label="ID Proof Number">
          <input required value={agreement.idProofNumber} onChange={(e) => update("idProofNumber", e.target.value)} className="input" />
        </Field>

        <Field label="Kilometer Limit for this Trip">
          <input
            value={`${kmLimit} KM`}
            disabled
            className="input opacity-60 bg-graphite-raised/20"
          />
        </Field>
        <Field label="Total Rental Amount">
          <input value={`₹${rentTotal.toLocaleString("en-IN")}`} disabled className="input opacity-60 bg-graphite-raised/20 font-bold text-brass" />
        </Field>
      </div>

      <div>
        <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-brass">Terms & Conditions</h3>
        <ol className="space-y-2.5 rounded-card border border-graphite-line bg-graphite-raised/30 p-4 text-xs leading-relaxed text-steel">
          {RENTAL_TERMS.map((term, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="flex-shrink-0 font-mono text-brass">{i + 1}.</span>
              <span>{term}</span>
            </li>
          ))}
        </ol>
      </div>

      <label className="flex items-start gap-3 rounded-card border border-graphite-line bg-graphite p-4">
        <input
          type="checkbox"
          checked={agreement.agreedToTerms}
          onChange={(e) => update("agreedToTerms", e.target.checked)}
          className="mt-0.5 accent-brass"
        />
        <span className="text-sm text-ivory">
          I have read and agree to the Rental Agreement and Terms & Conditions above. I understand this serves as my
          digital signature and declaration in place of a physical signature and thumbprint.
        </span>
      </label>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-steel">{label}</span>
      {children}
    </label>
  );
}
