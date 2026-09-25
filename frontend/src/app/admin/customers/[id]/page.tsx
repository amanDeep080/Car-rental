"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { getCustomerDetail, blockCustomer, unblockCustomer, updateCustomer, getCustomerDocuments, type AdminCustomerSummary, type AdminDocument } from "@/services/adminService";
import { User, Mail, Phone, Calendar, Clock, ShieldCheck, ShieldAlert, ArrowLeft, Ban, CheckCircle2, Edit, X, FileText, ExternalLink, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/cn";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<AdminCustomerSummary | null>(null);
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  function loadData() {
    Promise.all([
      getCustomerDetail(id as string),
      getCustomerDocuments(id as string)
    ])
      .then(([c, docs]) => {
        setCustomer(c);
        setDocuments(docs);
      })
      .catch(() => setCustomer(null))
      .finally(() => setLoading(false));
  }

  async function toggleStatus() {
    if (!customer) return;
    if (customer.active) {
      if (!confirm("Block this customer? They won't be able to log in.")) return;
      await blockCustomer(customer.id);
    } else {
      await unblockCustomer(customer.id);
    }
    loadData();
  }

  if (loading) return <AdminLayout><p className="text-steel">Loading customer profile...</p></AdminLayout>;
  if (!customer) return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-graphite-raised">
          <User size={20} className="text-steel" />
        </div>
        <p className="text-sm text-steel">Customer profile not found.</p>
        <button onClick={() => router.back()} className="mt-4 text-xs text-brass hover:underline">Go Back</button>
      </div>
    </AdminLayout>
  );

  const isOnline = customer.lastSeenAt && (new Date().getTime() - new Date(customer.lastSeenAt).getTime() < 60000);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-xs text-steel hover:text-ivory">
          <ArrowLeft size={14} /> Back
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 rounded-full border border-graphite-line bg-graphite px-4 py-2 text-xs text-ivory hover:border-brass transition-colors"
        >
          <Edit size={14} /> Edit Profile
        </button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-graphite-raised text-brass">
            <User size={40} strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-700 text-ivory">{customer.fullName}</h1>
              {isOnline ? (
                <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-[10px] font-bold text-green-500 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                </span>
              ) : (
                <span className="rounded-full bg-graphite-raised px-2.5 py-0.5 text-[10px] font-bold text-steel uppercase tracking-wider">Offline</span>
              )}
            </div>
            <p className="mt-1 text-sm text-steel">{customer.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/cars?onBehalfOf=${customer.id}`}
            className="flex items-center gap-2 rounded-full bg-brass-sheen px-5 py-2.5 text-sm font-medium text-obsidian transition-transform hover:scale-[1.02]"
          >
            <Plus size={15} /> Create Booking
          </Link>
          <button
            onClick={toggleStatus}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
              customer.active
                ? "bg-signal-booked/10 text-signal-booked hover:bg-signal-booked/20"
                : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
            }`}
          >
            {customer.active ? <><Ban size={15} /> Block Account</> : <><CheckCircle2 size={15} /> Unblock Account</>}
          </button>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           <div className="rounded-panel border border-graphite-line bg-graphite p-6">
            <h2 className="mb-6 font-mono text-[11px] uppercase tracking-widest text-brass">Account Details</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <Detail icon={Mail} label="Email Address" value={customer.email} verified={customer.emailVerified} />
              <Detail icon={Phone} label="Phone Number" value={customer.phone || "Not provided"} />
              <Detail icon={Calendar} label="Member Since" value={format(new Date(customer.createdAt), "PPP")} />
              <Detail icon={Clock} label="Last Activity" value={customer.lastSeenAt ? format(new Date(customer.lastSeenAt), "PPpp") : "Never"} />
            </div>
          </div>

          <div className="rounded-panel border border-graphite-line bg-graphite p-6">
            <h2 className="mb-4 font-mono text-[11px] uppercase tracking-widest text-brass">Uploaded Documents</h2>
            <div className="space-y-3">
              {[
                { type: "DRIVING_LICENSE", label: "Driving License" },
                { type: "GOVERNMENT_ID", label: "Aadhaar / Passport", legacy: "PAN_OR_PASSPORT" },
                { type: "LPU_ID", label: "LPU ID Card" }
              ].map((required) => {
                const doc = documents
                  .filter(d => d.documentType === required.type || (required.legacy && d.documentType === required.legacy))
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

                return (
                  <div key={required.type} className="flex items-center justify-between p-4 rounded-xl bg-graphite-raised/30 border border-graphite-line">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", doc ? "bg-brass/10 text-brass" : "bg-graphite-line text-steel")}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-ivory font-500">{required.label}</p>
                        {doc ? (
                          <p className="text-[10px] text-steel uppercase tracking-wider">{format(new Date(doc.createdAt), "PPP")}</p>
                        ) : (
                          <p className="text-[10px] text-signal-booked uppercase tracking-wider font-bold">Missing</p>
                        )}
                      </div>
                    </div>
                    {doc && (
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-bold uppercase ${
                          doc.status === "VERIFIED" ? "text-green-500" :
                          doc.status === "REJECTED" ? "text-signal-booked" : "text-brass"
                        }`}>
                          {doc.status}
                        </span>
                        {doc.url && doc.url.startsWith("http") && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-steel hover:text-ivory"
                            title="View Document"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-panel border border-graphite-line bg-graphite p-6">
            <h2 className="mb-6 font-mono text-[11px] uppercase tracking-widest text-brass">Engagement</h2>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-2xl font-700 text-ivory">{customer.totalBookings}</p>
              <p className="text-xs text-steel uppercase tracking-widest">Total Bookings Completed</p>
            </div>
          </div>

          <div className="rounded-panel border border-graphite-line bg-graphite p-6">
            <h2 className="mb-6 font-mono text-[11px] uppercase tracking-widest text-brass">Verification Status</h2>
            <div className="space-y-4">
              <StatusItem
                label="Email Verified"
                status={customer.emailVerified}
                icon={customer.emailVerified ? ShieldCheck : ShieldAlert}
              />
              <StatusItem
                label={`Identity (${documents.filter(d => d.status === "VERIFIED").length}/3 Verified)`}
                status={documents.filter(d => d.status === "VERIFIED").length >= 3}
                icon={documents.filter(d => d.status === "VERIFIED").length >= 3 ? ShieldCheck : ShieldAlert}
              />
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <EditCustomerModal
          customer={customer}
          onClose={() => setIsEditing(false)}
          onSuccess={() => { setIsEditing(false); loadData(); }}
        />
      )}
    </AdminLayout>
  );
}

function EditCustomerModal({ customer, onClose, onSuccess }: { customer: AdminCustomerSummary, onClose: () => void, onSuccess: () => void }) {
  const [form, setForm] = useState({
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone || "",
    password: "",
    dateOfBirth: "", // Would need mapping
    emailVerified: customer.emailVerified,
    active: customer.active,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCustomer(customer.id, form);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian/80 backdrop-blur-sm p-6">
      <div className="w-full max-w-xl bg-graphite border border-graphite-line rounded-panel shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-graphite-line p-6">
          <h2 className="font-display text-lg font-700 text-ivory">Edit Customer Profile</h2>
          <button onClick={onClose} className="text-steel hover:text-ivory"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="text-xs text-signal-booked bg-signal-booked/10 p-3 rounded-lg border border-signal-booked/20">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name">
              <input required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="input" />
            </Field>
            <Field label="Email Address">
              <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input" />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input" />
            </Field>
            <Field label="New Password (Optional)">
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input" placeholder="Leave blank to keep current" />
            </Field>
          </div>
          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.emailVerified} onChange={e => setForm({...form, emailVerified: e.target.checked})} className="accent-brass" />
              <span className="text-sm text-steel">Email Verified</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="accent-brass" />
              <span className="text-sm text-steel">Account Active</span>
            </label>
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-full bg-brass-sheen py-3 text-sm font-medium text-obsidian">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-steel uppercase tracking-wider font-600">{label}</span>
      {children}
    </label>
  );
}

function Detail({ icon: Icon, label, value, verified }: { icon: any, label: string, value: string, verified?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={14} className="text-steel" />
        <span className="text-[10px] uppercase tracking-widest text-steel font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-ivory font-500">{value}</span>
        {verified && <CheckCircle2 size={12} className="text-green-500" />}
      </div>
    </div>
  );
}

function StatusItem({ label, status, icon: Icon }: { label: string, status: boolean, icon: any }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-graphite-raised/30 border border-graphite-line">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${status ? "bg-green-500/10 text-green-500" : "bg-signal-booked/10 text-signal-booked"}`}>
          <Icon size={16} />
        </div>
        <span className="text-xs text-ivory font-medium">{label}</span>
      </div>
      <span className={`text-[10px] font-bold uppercase ${status ? "text-green-500" : "text-signal-booked"}`}>
        {status ? "Verified" : "Pending"}
      </span>
    </div>
  );
}
