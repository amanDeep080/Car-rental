"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { getAdminCustomers, type AdminCustomerSummary } from "@/services/adminService";
import { User, Mail, Search, Plus } from "lucide-react";

export default function AdminCustomersPage() {
  const ready = useAdminGuard();
  const [customers, setCustomers] = useState<AdminCustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!ready) return;
    load();
  }, [ready]);

  function load() {
    setLoading(true);
    getAdminCustomers()
      .then(setCustomers)
      .finally(() => setLoading(false));
  }

  const filtered = customers.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-display-md font-700 text-ivory">Customers</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-graphite-line bg-graphite-raised/60 px-3">
            <Search size={14} className="text-steel" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="bg-transparent py-2.5 text-sm text-ivory outline-none placeholder:text-steel w-64"
            />
          </div>
          <Link
            href="/admin/customers/new"
            className="flex items-center gap-1.5 rounded-full bg-brass-sheen px-5 py-2.5 text-sm font-medium text-obsidian transition-transform hover:scale-[1.02]"
          >
            <Plus size={15} /> Add Customer
          </Link>
        </div>
      </div>

      {loading && <p className="mt-6 text-sm text-steel">Loading...</p>}

      {!loading && (
        <div className="mt-8 overflow-x-auto rounded-panel border border-graphite-line">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-graphite-line bg-graphite text-xs text-steel">
                <th className="px-4 py-3 font-normal">Customer</th>
                <th className="px-4 py-3 font-normal">Phone</th>
                <th className="px-4 py-3 font-normal">Bookings</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-graphite-line last:border-0 hover:bg-graphite-raised/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-graphite-raised text-brass">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="text-ivory font-500">{c.fullName}</p>
                        <p className="text-[11px] text-steel">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-steel">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-steel">{c.totalBookings}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      c.active ? "bg-green-500/10 text-green-500" : "bg-signal-booked/10 text-signal-booked"
                    }`}>
                      {c.active ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/cars?onBehalfOf=${c.id}`}
                        className="flex items-center gap-1 text-[10px] font-700 uppercase tracking-wider text-brass hover:text-brass-sheen transition-colors"
                      >
                        <Plus size={12} /> Book Car
                      </Link>
                      <Link href={`/admin/customers/${c.id}`} className="text-xs text-steel hover:text-ivory hover:underline">
                        View Profile
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="p-8 text-center text-sm text-steel">No customers found.</p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
