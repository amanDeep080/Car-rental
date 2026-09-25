"use client";

import { useState } from "react";
import { Upload, CheckCircle2 } from "lucide-react";
import { recordDocument } from "@/services/documentService";

const REQUIRED_DOCS = [
  { type: "DRIVING_LICENSE", label: "Driving License" },
  { type: "GOVERNMENT_ID", label: "Aadhaar Card / Government ID" },
  { type: "LPU_ID", label: "LPU ID Card" },
];

export default function StepDocuments({
  uploaded,
  onUploaded,
  onRemove,
}: {
  uploaded: Set<string>;
  onUploaded: (type: string) => void;
  onRemove: (type: string) => void;
}) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(type: string, file: File | undefined) {
    if (!file) return;
    setUploading(type);
    setError(null);
    try {
      await recordDocument(type, file);
      onUploaded(type);
    } catch {
      setError("Couldn't record that document right now. Please try again.");
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-600 text-ivory">Verify your documents</h2>
      <p className="text-sm text-steel">
        Upload clear photos or scans. <strong>All documents are mandatory</strong> to proceed.
      </p>

      {error && <p className="text-sm text-signal-booked">{error}</p>}

      <div className="space-y-3">
        {REQUIRED_DOCS.map((doc) => {
          const done = uploaded.has(doc.type);
          return (
            <div
              key={doc.type}
              className={`flex items-center justify-between rounded-card border p-4 transition-colors ${
                done ? "border-signal-available/50 bg-signal-available/5" : "border-graphite-line bg-graphite-raised/30"
              }`}
            >
              <div className="flex items-center gap-3">
                {done ? (
                  <CheckCircle2 size={18} className="text-signal-available" />
                ) : (
                  <Upload size={18} className="text-steel" />
                )}
                <div>
                  <p className="text-sm text-ivory">{doc.label}</p>
                  <p className="text-xs text-steel">{done ? "Uploaded — pending review" : "Not uploaded yet"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {done && (
                  <button
                    type="button"
                    onClick={() => onRemove(doc.type)}
                    className="text-xs text-signal-booked hover:underline"
                  >
                    Remove
                  </button>
                )}
                <label className="cursor-pointer text-xs text-brass hover:underline">
                  {uploading === doc.type ? "Uploading…" : done ? "Replace" : "Upload"}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFile(doc.type, e.target.files?.[0])}
                    disabled={uploading === doc.type}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
