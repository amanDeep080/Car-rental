"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getMyDocuments, recordDocument, type DocumentRecord } from "@/services/documentService";
import { Upload, Clock, CheckCircle2, XCircle } from "lucide-react";

const STATUS_META: Record<string, { icon: typeof Clock; className: string }> = {
  PENDING: { icon: Clock, className: "text-signal-pending" },
  UNDER_REVIEW: { icon: Clock, className: "text-signal-pending" },
  VERIFIED: { icon: CheckCircle2, className: "text-signal-available" },
  REJECTED: { icon: XCircle, className: "text-signal-booked" },
  EXPIRED: { icon: XCircle, className: "text-signal-booked" },
};

const DOC_TYPES = [
  { type: "DRIVING_LICENSE", label: "Driving License" },
  { type: "GOVERNMENT_ID", label: "Aadhaar Card / Government ID" },
  { type: "PAN_OR_PASSPORT", label: "PAN Card or Passport" },
  { type: "LPU_ID", label: "LPU Student ID Card" },
  { type: "ADDRESS_PROOF", label: "Address Proof" },
];

export default function DocumentsPage() {
  const ready = useAuthGuard();
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    getMyDocuments().then(setDocs).catch(() => setDocs([])).finally(() => setLoading(false));
  }, [ready]);

  async function handleUpload(type: string, file: File | undefined) {
    if (!file) return;
    setUploading(type);
    try {
      const doc = await recordDocument(type, file);
      setDocs((prev) => [doc, ...prev.filter((d) => d.documentType !== type)]);
    } finally {
      setUploading(null);
    }
  }

  if (!ready) return null;

  return (
    <DashboardLayout>
      <h1 className="font-display text-display-md font-700 text-ivory">Documents</h1>
      <p className="mt-2 text-sm text-steel">
        We verify these once so future bookings go faster. NRIs should also add a passport and visa copy.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-steel">Loading…</p>
      ) : (
        <div className="mt-8 space-y-3">
          {DOC_TYPES.map((docType) => {
            const existing = docs.find((d) => d.documentType === docType.type);
            const meta = existing ? STATUS_META[existing.status] : null;
            const Icon = meta?.icon ?? Upload;

            return (
              <label
                key={docType.type}
                className="flex cursor-pointer items-center justify-between rounded-card border border-graphite-line bg-graphite p-4"
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={meta?.className ?? "text-steel"} />
                  <div>
                    <p className="text-sm text-ivory">{docType.label}</p>
                    <p className="mt-0.5 text-xs text-steel">
                      {existing ? existing.status.replace(/_/g, " ") : "Not uploaded"}
                      {existing?.rejectionReason ? ` — ${existing.rejectionReason}` : ""}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-brass">
                  {uploading === docType.type ? "Uploading…" : existing ? "Replace" : "Upload"}
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleUpload(docType.type, e.target.files?.[0])}
                />
              </label>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
