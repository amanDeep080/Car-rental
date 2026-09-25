"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { getPendingDocuments, getCustomerDetail, getCustomerDocuments, approveDocument, rejectDocument, type AdminDocument } from "@/services/adminService";
import { CheckCircle2, X, XCircle, UserRound, FileText, ExternalLink } from "lucide-react";

export default function AdminDocumentsPage() {
  const ready = useAdminGuard();
  const [docs, setDocs] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [selected, setSelected] = useState<CustomerDocuments | null>(null);

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready]);

  async function load() {
    setLoading(true);
    try {
      const documents = (await getPendingDocuments()).filter((document) => document.status === "PENDING");
      const customerIds = Array.from(new Set(documents.map((document) => document.userId).filter((id): id is string => Boolean(id))));
      const customers = await Promise.all(customerIds.map(async (id) => {
        try { return await getCustomerDetail(id); } catch { return null; }
      }));
      const customerMap = new Map(customers.filter(Boolean).map((customer) => [customer!.id, customer!]));
      setDocs(documents.map((document) => {
        const customer = document.userId ? customerMap.get(document.userId) : undefined;
        return customer ? { ...document, userName: customer.fullName, userEmail: customer.email, userPhone: customer.phone } : document;
      }));
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    setActing(id);
    try {
      await approveDocument(id);
      load();
    } finally {
      setActing(null);
    }
  }

  async function openCustomer(customer: CustomerDocuments) {
    setSelected(customer);
    if (!customer.userId) return;
    try {
      const allDocuments = await getCustomerDocuments(customer.userId);
      setSelected({ ...customer, documents: allDocuments });
    } catch {
      // Keep the pending documents visible if the history request fails.
    }
  }

  async function handleReject(id: string) {
    const reason = prompt("Reason for rejection (shown to the customer):");
    if (!reason) return;
    setActing(id);
    try {
      await rejectDocument(id, reason);
      load();
    } finally {
      setActing(null);
    }
  }

  if (!ready) return null;

  const customers = groupByCustomer(docs);

  return (
    <AdminLayout>
      <h1 className="font-display text-display-md font-700 text-ivory">Document Verifications</h1>
      <p className="mt-2 text-sm text-steel">Review pending customer documents before their booking can be confirmed.</p>

      {loading && <p className="mt-6 text-sm text-steel">Loading…</p>}

      {!loading && docs.length === 0 && (
        <div className="mt-8 rounded-panel border border-dashed border-graphite-line py-16 text-center">
          <CheckCircle2 size={24} className="mx-auto text-signal-available" />
          <p className="mt-3 text-sm text-ivory">Nothing pending review.</p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {customers.map((customer) => (
          <div key={customer.key} className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-graphite-line bg-graphite p-4">
            <button onClick={() => openCustomer(customer)} className="flex min-w-0 items-center gap-3 text-left hover:opacity-80">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brass-sheen/10 text-brass"><UserRound size={16} /></span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-ivory">{customer.userName}</span>
                <span className="block truncate text-xs text-steel">{customer.userEmail}</span>
                <span className="mt-1 block text-xs text-steel"><FileText size={12} className="mr-1 inline" />{customer.documents.length} document{customer.documents.length === 1 ? "" : "s"} uploaded</span>
              </span>
            </button>
            <div className="flex items-center gap-2">
              <StatusSummary documents={customer.documents} />
              <span className="text-xs text-brass">View profile</span>
            </div>
          </div>
        ))}
      </div>

      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/80 p-4" onClick={() => setSelected(null)}>
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-panel border border-graphite-line bg-graphite p-6" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs uppercase tracking-[0.16em] text-brass">Customer profile</p><h2 className="mt-1 text-xl text-ivory">{selected.userName}</h2><p className="mt-1 text-sm text-steel">{selected.userEmail}{selected.userPhone ? ` · ${selected.userPhone}` : ""}</p><p className="mt-2 text-xs text-steel">{selected.documents.length} uploaded document{selected.documents.length === 1 ? "" : "s"}</p></div>
            <button onClick={() => setSelected(null)} aria-label="Close profile" className="rounded-full p-2 text-steel hover:bg-graphite-line hover:text-ivory"><X size={18} /></button>
          </div>
          <div className="mt-6 space-y-4">{selected.documents.map((doc) => <div key={doc.id} className="rounded-card border border-graphite-line bg-obsidian/40 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-ivory">{doc.documentType.replace(/_/g, " ")}</p><p className="mt-1 text-xs text-steel">Submitted {new Date(doc.createdAt).toLocaleString()}</p></div><div className="flex items-center gap-2"><StatusBadge status={doc.status} />{doc.status === "PENDING" && <><button onClick={() => handleApprove(doc.id)} disabled={acting === doc.id} className="flex items-center gap-1 rounded-full bg-signal-available/10 px-3 py-1.5 text-xs text-signal-available disabled:opacity-50"><CheckCircle2 size={12} /> Approve</button><button onClick={() => handleReject(doc.id)} disabled={acting === doc.id} className="flex items-center gap-1 rounded-full border border-signal-booked/40 px-3 py-1.5 text-xs text-signal-booked disabled:opacity-50"><XCircle size={12} /> Reject</button></>}</div></div>{doc.url ? <div className="mt-4 overflow-hidden rounded-lg border border-graphite-line bg-black"><img src={doc.url} alt={`${selected.userName}'s ${doc.documentType.replace(/_/g, " ")}`} className="max-h-[42vh] w-full object-contain" /></div> : <p className="mt-4 text-sm text-steel">No document preview is available.</p>}{doc.url && <a href={doc.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs text-brass hover:underline">Open document in new tab <ExternalLink size={13} /></a>}{doc.rejectionReason && <p className="mt-3 text-xs text-signal-booked">Rejection reason: {doc.rejectionReason}</p>}</div>)}</div>
        </div>
      </div>}
    </AdminLayout>
  );
}

type CustomerDocuments = {
  key: string;
  userId?: string;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  documents: AdminDocument[];
};

function groupByCustomer(documents: AdminDocument[]): CustomerDocuments[] {
  const groups = new Map<string, CustomerDocuments>();
  documents.forEach((document) => {
    const key = document.userId || document.userEmail || document.id;
    const existing = groups.get(key);
    if (existing) {
      existing.documents.push(document);
      return;
    }
    groups.set(key, {
      key,
      userId: document.userId,
      userName: document.userName || (document.userId ? `Customer ${document.userId.slice(0, 8)}` : "Customer profile unavailable"),
      userEmail: document.userEmail || "Email unavailable",
      userPhone: document.userPhone,
      documents: [document]
    });
  });
  return Array.from(groups.values());
}

function StatusSummary({ documents }: { documents: AdminDocument[] }) {
  const pending = documents.filter((document) => document.status === "PENDING").length;
  const verified = documents.filter((document) => document.status === "VERIFIED").length;
  return <span className="text-xs text-steel">{pending > 0 ? `${pending} pending` : `${verified} verified`}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = { VERIFIED: "bg-signal-available/10 text-signal-available", REJECTED: "bg-signal-booked/10 text-signal-booked", PENDING: "bg-brass-sheen/10 text-brass" };
  return <span className={`rounded-full px-3 py-1.5 text-xs ${styles[status] ?? "bg-graphite-line text-steel"}`}>{status === "VERIFIED" ? "Verified" : status === "REJECTED" ? "Rejected" : "Pending review"}</span>;
}
