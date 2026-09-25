"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import {
  getAdminBookings,
  getAdminBookingDetail,
  confirmBooking,
  cancelAdminBooking,
  markPickup,
  markReturn,
  markComplete,
  approveDocument,
  rejectDocument,
  type AdminBookingSummary,
  type AdminBookingDetail,
} from "@/services/adminService";
import { Search, Plus, UserCircle, X, Car, Info, Clock, MapPin, Receipt, FileText, ChevronRight, Check, XCircle, ExternalLink } from "lucide-react";
import { getAdminCustomers, type AdminCustomerSummary } from "@/services/adminService";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { getCustomerDocuments, type AdminDocument } from "@/services/adminService";
import { formatDuration } from "@/types/booking";

const STATUS_OPTIONS = [
  "", "PENDING", "AWAITING_VERIFICATION", "AWAITING_PAYMENT", "CONFIRMED",
  "READY_FOR_PICKUP", "ACTIVE", "RETURNED", "INSPECTION_PENDING", "COMPLETED", "CANCELLED",
];

const NEXT_ACTION: Record<string, { label: string; fn: (id: string) => Promise<void> }> = {
  AWAITING_VERIFICATION: { label: "Confirm", fn: confirmBooking },
  AWAITING_PAYMENT: { label: "Confirm", fn: confirmBooking },
  CONFIRMED: { label: "Mark Picked Up", fn: markPickup },
  READY_FOR_PICKUP: { label: "Mark Picked Up", fn: markPickup },
  ACTIVE: { label: "Mark Returned", fn: markReturn },
  RETURNED: { label: "Mark Completed", fn: markComplete },
  INSPECTION_PENDING: { label: "Mark Completed", fn: markComplete },
};

const CANCELLABLE = new Set(["PENDING", "AWAITING_VERIFICATION", "AWAITING_PAYMENT", "CONFIRMED", "READY_FOR_PICKUP"]);

export default function AdminBookingsPage() {
  const ready = useAdminGuard();
  const router = useRouter();
  const [bookings, setBookings] = useState<AdminBookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("");
  const [actingOn, setActingOn] = useState<string | null>(null);
  const [showCreateModal, setShowCreateBookingModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, status]);

  function load() {
    setLoading(true);
    getAdminBookings({ status: status || undefined, customerEmail: email || undefined })
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }

  async function handleAction(id: string, fn: (id: string) => Promise<void>) {
    setActingOn(id);
    try {
      await fn(id);
      load();
    } finally {
      setActingOn(null);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    await handleAction(id, (bookingId) => cancelAdminBooking(bookingId));
  }

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-display-md font-700 text-ivory">Bookings</h1>
        <button
          onClick={() => setShowCreateBookingModal(true)}
          className="flex items-center gap-1.5 rounded-full bg-brass-sheen px-5 py-2.5 text-sm font-medium text-obsidian transition-transform hover:scale-[1.02]"
        >
          <Plus size={15} /> Create Booking
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto">
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="bg-graphite-raised">
              {s || "All statuses"}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 rounded-lg border border-graphite-line bg-graphite-raised/60 px-3">
          <Search size={14} className="text-steel" />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search by customer email"
            className="bg-transparent py-2.5 text-sm text-ivory outline-none placeholder:text-steel"
          />
        </div>
        <button onClick={load} className="rounded-lg border border-graphite-line px-4 text-sm text-ivory hover:border-brass">
          Search
        </button>
      </div>

      {loading && <p className="mt-6 text-sm text-steel">Loading…</p>}

      {!loading && (
        <div className="mt-6 overflow-x-auto rounded-panel border border-graphite-line">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-graphite-line bg-graphite text-xs text-steel">
                <th className="px-4 py-3 font-normal">Reference</th>
                <th className="px-4 py-3 font-normal">Customer</th>
                <th className="px-4 py-3 font-normal">Vehicle</th>
                <th className="px-4 py-3 font-normal">Pickup</th>
                <th className="px-4 py-3 font-normal">Return</th>
                <th className="px-4 py-3 font-normal">Duration</th>
                <th className="px-4 py-3 font-normal">Total</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const action = NEXT_ACTION[b.status];
                return (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedBookingId(b.id)}
                    className="border-b border-graphite-line last:border-0 hover:bg-graphite-raised/30 cursor-pointer group"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-ivory group-hover:text-brass transition-colors">{b.bookingReference}</td>
                    <td className="px-4 py-3">
                      <p className="text-ivory">{b.customerName}</p>
                      <p className="text-xs text-steel">{b.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-steel">{b.carLabel}</td>
                    <td className="px-4 py-3 text-xs text-steel">{new Date(b.pickupAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td className="px-4 py-3 text-xs text-steel">{new Date(b.returnAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td className="px-4 py-3 text-xs text-ivory">{formatDuration(b.durationDays, b.durationHours)}</td>
                    <td className="px-4 py-3 text-ivory">₹{b.totalPayable.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {action && (
                          <button
                            onClick={() => handleAction(b.id, action.fn)}
                            disabled={actingOn === b.id}
                            className="rounded-full bg-brass/10 px-3 py-1.5 text-xs text-brass hover:bg-brass/20 disabled:opacity-50"
                          >
                            {action.label}
                          </button>
                        )}
                        {CANCELLABLE.has(b.status) && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            disabled={actingOn === b.id}
                            className="rounded-full border border-signal-booked/40 px-3 py-1.5 text-xs text-signal-booked hover:bg-signal-booked/10 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {bookings.length === 0 && <p className="p-8 text-center text-sm text-steel">No bookings match this filter.</p>}
        </div>
      )}

      {showCreateModal && (
        <AdminSelectCustomerModal
          onClose={() => setShowCreateBookingModal(false)}
          onSelect={(customerId) => {
            setShowCreateBookingModal(false);
            router.push(`/cars?onBehalfOf=${customerId}`);
          }}
        />
      )}

      {selectedBookingId && (
        <AdminBookingDetailModal
          id={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          onUpdate={load}
        />
      )}
    </AdminLayout>
  );
}

function AdminBookingDetailModal({ id, onClose, onUpdate }: { id: string; onClose: () => void; onUpdate: () => void }) {
  const [booking, setBooking] = useState<AdminBookingDetail | null>(null);
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);

  function loadDetails() {
    getAdminBookingDetail(id)
      .then((b) => {
        setBooking(b);
        return getCustomerDocuments(b.customer.id);
      })
      .then((docs) => {
        console.log("Loaded documents for customer:", docs);
        setDocuments(docs);
      })
      .catch((err) => {
        console.error("Error loading booking details:", err);
        setError("Failed to load booking details. Please try again.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDetails();
  }, [id]);

  async function handleDocAction(docId: string, action: 'approve' | 'reject') {
    setVerifying(docId);
    try {
      if (action === 'approve') await approveDocument(docId);
      else await rejectDocument(docId, "Document does not meet requirements.");

      // Full refresh to update both document statuses and overall booking state
      loadDetails();
    } catch (err) {
      console.error("Document action failed:", err);
      alert("Failed to update document status. Please try again.");
    } finally {
      setVerifying(null);
    }
  }

  async function handleAction(fn: (id: string) => Promise<void>) {
    setActing(true);
    try {
      await fn(id);
      onUpdate();
      onClose();
    } finally {
      setActing(false);
    }
  }

  if (loading) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/80 backdrop-blur-sm">
      <div className="text-steel animate-pulse text-sm">Synchronizing booking data...</div>
    </div>
  );

  if (error || !booking) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/80 backdrop-blur-sm">
      <div className="bg-graphite border border-graphite-line p-8 rounded-panel text-center max-w-sm">
        <p className="text-signal-booked text-sm mb-4">{error || "Booking not found."}</p>
        <button onClick={onClose} className="rounded-full bg-graphite-raised px-6 py-2 text-xs font-bold text-ivory hover:bg-graphite-raised/80">Close</button>
      </div>
    </div>
  );

  const action = NEXT_ACTION[booking.status];
  const latestHistory = booking.history.at(-1);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/80 backdrop-blur-sm p-4 sm:p-10">
      <div className="w-full max-w-5xl bg-graphite border border-graphite-line rounded-panel shadow-2xl overflow-hidden flex flex-col max-h-full">
        <div className="flex items-center justify-between border-b border-graphite-line p-6 bg-graphite-raised/30">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-mono text-sm text-brass">{booking.bookingReference}</h2>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-xs text-steel">
              {latestHistory ? `Created on ${new Date(latestHistory.createdAt).toLocaleString()}` : "History unavailable"}
            </p>
          </div>
          <button onClick={onClose} className="text-steel hover:text-ivory bg-graphite-raised p-2 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-graphite-raised">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Customer & Vehicle */}
            <div className="space-y-8">
              <section>
                <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-steel mb-4">
                  <UserCircle size={14} className="text-brass" /> Customer Profile
                </h3>
                <div className="rounded-xl border border-graphite-line bg-graphite-raised/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-600 text-ivory">{booking.customer.fullName}</p>
                    <Link href={`/admin/customers/${booking.customer.id}`} className="text-[10px] text-brass hover:underline flex items-center gap-0.5">
                      View Profile <ChevronRight size={10} />
                    </Link>
                  </div>
                  <p className="text-xs text-steel mt-0.5">{booking.customer.email}</p>
                  <p className="text-xs text-steel mt-0.5">{booking.customer.phone}</p>
                  <div className="mt-4 pt-4 border-t border-graphite-line flex items-center justify-between">
                     <span className="text-[10px] text-steel uppercase">Documents Verified</span>
                     <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                        documents.filter(d => d.status === 'VERIFIED').length >= 3
                        ? "bg-signal-available/20 text-signal-available"
                        : "bg-signal-booked/20 text-signal-booked"
                     )}>
                       {documents.filter(d => d.status === 'VERIFIED').length}/3 Verified
                     </span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-steel mb-4">
                  <Car size={14} className="text-brass" /> Vehicle Info
                </h3>
                <div className="rounded-xl border border-graphite-line bg-graphite-raised/20 p-4">
                  <p className="text-sm font-600 text-ivory">{booking.car.brand} {booking.car.model}</p>
                  <p className="text-xs text-steel mt-0.5">{booking.car.variant}</p>
                  <p className="text-xs text-brass font-mono mt-2 uppercase tracking-tighter">Reg: {booking.car.registrationNumber || "NOT ASSIGNED"}</p>
                </div>
              </section>

              <section>
                <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-steel mb-4">
                  <Clock size={14} className="text-brass" /> Reservation
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-signal-available mt-1.5" />
                      <div className="w-px flex-1 bg-graphite-line my-1" />
                      <div className="w-1.5 h-1.5 rounded-full bg-signal-booked" />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] uppercase text-steel leading-none">Pickup</p>
                        <p className="text-xs text-ivory mt-1">{new Date(booking.pickupAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-steel leading-none">Duration</p>
                        <p className="text-xs text-brass mt-1">{formatDuration(booking.durationDays, booking.durationHours)}</p>
                        <p className="text-[10px] text-steel mt-1">{booking.durationDays} total days · {booking.durationHours} remaining hours</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-steel leading-none">Return</p>
                        <p className="text-xs text-ivory mt-1">{new Date(booking.returnAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Middle Col: Documents & Agreement */}
            <div className="space-y-8 lg:col-span-2">
               <section>
                <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-steel mb-4">
                  <FileText size={14} className="text-brass" /> Rental Agreement (Deponent Details)
                </h3>
                {booking.agreement ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-graphite-line bg-graphite-raised/20 p-5">
                    <InfoItem label="Full Name" value={booking.agreement.fullName} />
                    <InfoItem label="Mobile" value={booking.agreement.mobileNumber} />
                    <InfoItem label="Guardian" value={`${booking.agreement.guardianRelation} ${booking.agreement.guardianName}`} />
                    <InfoItem label="Address" value={booking.agreement.residentAddress} full />
                    <InfoItem label="Driving License" value={booking.agreement.drivingLicenseNumber} />
                    <InfoItem label="LPU Reg #" value={booking.agreement.universityRegistrationNumber || "N/A"} />
                    <InfoItem label="ID Proof" value={`${booking.agreement.idProofType}: ${booking.agreement.idProofNumber}`} />
                    <InfoItem label="KM Limit" value={`${booking.agreement.kmPerDayLimit} KM`} />
                  </div>
                ) : (
                  <div className="p-10 border-2 border-dashed border-graphite-line rounded-xl text-center">
                    <p className="text-xs text-steel italic">Agreement not yet submitted by customer.</p>
                  </div>
                )}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section>
                  <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-steel mb-4">
                    <Receipt size={14} className="text-brass" /> Financials
                  </h3>
                  <div className="rounded-xl border border-graphite-line bg-graphite-raised/20 p-5 space-y-3 font-mono">
                    <div className="flex justify-between text-xs text-steel">
                      <span>Rental Amount</span>
                      <span className="text-ivory">₹{booking.rentalAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-xs text-steel">
                      <span>Method</span>
                      <span className="text-ivory">{booking.paymentMethod}</span>
                    </div>
                    <div className="pt-3 border-t border-graphite-line flex justify-between text-sm font-bold">
                      <span className="text-steel uppercase text-[10px] font-bold tracking-widest">Total Payable</span>
                      <span className="text-brass">₹{booking.totalPayable.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-steel mb-4">
                    <Info size={14} className="text-brass" /> Documents status
                  </h3>
                  <div className="space-y-3">
                    {[
                      { type: "DRIVING_LICENSE", label: "Driving License" },
                      { type: "GOVERNMENT_ID", label: "Aadhaar / Passport", legacy: "PAN_OR_PASSPORT" },
                      { type: "LPU_ID", label: "LPU ID Card" }
                    ].map(required => {
                      const doc = documents
                        .filter(d => d.documentType === required.type || (required.legacy && d.documentType === required.legacy))
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

                      const isPending = doc && doc.status === "PENDING";

                      return (
                        <div key={required.type} className="rounded-lg bg-graphite-raised/40 border border-graphite-line overflow-hidden">
                          <div className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] text-steel font-medium">{required.label}</span>
                              {doc ? (
                                <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase",
                                  doc.status === "VERIFIED" ? "bg-signal-available/20 text-signal-available" :
                                  doc.status === "REJECTED" ? "bg-signal-booked/20 text-signal-booked" :
                                  "bg-brass/20 text-brass")}>
                                  {doc.status}
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-graphite-line text-steel uppercase">Missing</span>
                              )}
                            </div>

                            {doc ? (
                              <div className="flex items-center gap-2">
                                <a
                                  href={doc.url?.startsWith('http') ? doc.url : '#'}
                                  onClick={(e) => {
                                    if (!doc.url?.startsWith('http')) {
                                      e.preventDefault();
                                      alert("OLD RECORD: This document was uploaded as a text record before Cloudinary was configured. Raw key: " + doc.url);
                                    }
                                  }}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all",
                                    doc.url?.startsWith('http')
                                      ? "bg-brass text-obsidian hover:bg-ivory"
                                      : "bg-graphite-line text-steel cursor-help"
                                  )}
                                >
                                  {doc.url?.startsWith('http') ? "VIEW FILE" : "NO FILE"} <ExternalLink size={10} />
                                </a>
                              </div>
                            ) : (
                              <span className="text-[10px] text-steel italic">Not provided</span>
                            )}
                          </div>

                          {isPending && (
                            <div className="flex items-center gap-px bg-graphite-line/30 border-t border-graphite-line">
                              <button
                                disabled={verifying === doc.id}
                                onClick={() => handleDocAction(doc.id, 'approve')}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold text-signal-available hover:bg-signal-available/10 transition-colors"
                              >
                                <Check size={12} /> Approve
                              </button>
                              <div className="w-px h-4 bg-graphite-line" />
                              <button
                                disabled={verifying === doc.id}
                                onClick={() => handleDocAction(doc.id, 'reject')}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-bold text-signal-booked hover:bg-signal-booked/10 transition-colors"
                              >
                                <XCircle size={12} /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-graphite-raised/50 p-6 border-t border-graphite-line flex justify-between items-center">
          <div className="flex gap-3">
            {CANCELLABLE.has(booking.status) && (
              <button
                disabled={acting}
                onClick={() => handleAction((bid) => cancelAdminBooking(bid))}
                className="rounded-full border border-signal-booked/40 px-6 py-2.5 text-xs font-bold text-signal-booked hover:bg-signal-booked/10 transition-colors disabled:opacity-50"
              >
                Cancel Booking
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="rounded-full bg-graphite-raised px-6 py-2.5 text-xs font-bold text-ivory hover:bg-graphite-raised/80 transition-colors">Close</button>
            {action && (
              <button
                disabled={acting}
                onClick={() => handleAction(action.fn)}
                className="rounded-full bg-brass-sheen px-8 py-2.5 text-xs font-bold text-obsidian transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {action.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-[9px] uppercase text-steel tracking-tighter leading-none">{label}</p>
      <p className="text-xs text-ivory mt-1.5 break-words font-medium">{value}</p>
    </div>
  );
}

function AdminSelectCustomerModal({ onClose, onSelect }: { onClose: () => void; onSelect: (id: string) => void }) {
  const [customers, setCustomers] = useState<AdminCustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminCustomers()
      .then(setCustomers)
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/80 backdrop-blur-sm p-6">
      <div className="w-full max-w-xl bg-graphite border border-graphite-line rounded-panel shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-graphite-line p-6">
          <h2 className="font-display text-lg font-700 text-ivory">New Booking: Select Customer</h2>
          <button onClick={onClose} className="text-steel hover:text-ivory"><X size={20} /></button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 rounded-lg border border-graphite-line bg-graphite-raised/60 px-3 mb-6">
            <Search size={14} className="text-steel" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer by name or email..."
              className="bg-transparent py-2.5 text-sm text-ivory outline-none placeholder:text-steel w-full"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-brass/20">
            {loading ? (
              <p className="text-center py-10 text-sm text-steel">Loading customer list...</p>
            ) : filtered.length > 0 ? filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-graphite-raised/30 border border-graphite-line hover:border-brass/40 hover:bg-brass/5 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-graphite-raised text-steel group-hover:text-brass">
                    <UserCircle size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-600 text-ivory group-hover:text-brass">{c.fullName}</p>
                    <p className="text-[11px] text-steel">{c.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-brass opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[10px] font-bold uppercase tracking-widest">Select</span>
                   <Car size={14} />
                </div>
              </button>
            )) : (
              <p className="text-center py-10 text-sm text-steel">No customers found.</p>
            )}
          </div>
        </div>
        <div className="bg-graphite-raised/50 p-4 border-t border-graphite-line flex justify-between items-center">
          <p className="text-[10px] text-steel italic">Admins can create bookings for any verified customer.</p>
          <button onClick={onClose} className="text-xs text-ivory hover:underline">Cancel</button>
        </div>
      </div>
    </div>
  );
}
