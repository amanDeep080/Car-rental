"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { getAdminCars, getBookingReport, type BookingReportRow } from "@/services/adminService";
import { formatDuration } from "@/types/booking";
import { Download, FileText } from "lucide-react";

const statuses = ["", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED", "PENDING", "AWAITING_VERIFICATION"];

export default function AdminReportsPage() {
  const ready = useAdminGuard();
  const [from, setFrom] = useState(() => new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("");
  const [carId, setCarId] = useState("");
  const [reportType, setReportType] = useState("booking");
  const [cars, setCars] = useState<Array<{ id: string; brand: string; model: string; variant?: string }>>([]);
  const [rows, setRows] = useState<BookingReportRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (ready) getAdminCars().then(setCars).catch(() => setCars([])); }, [ready]);
  useEffect(() => { if (ready) load(); }, [ready]);

  async function load() {
    setLoading(true);
    try {
      const end = new Date(`${to}T23:59:59.999`).toISOString();
      setRows(await getBookingReport({ from: new Date(`${from}T00:00:00`).toISOString(), to: end, status: status || undefined, carId: carId || undefined }));
    } finally { setLoading(false); }
  }

  if (!ready) return null;
  const completedRows = rows.filter((row) => row.status === "COMPLETED");
  const cancelledRows = rows.filter((row) => row.status === "CANCELLED");
  const total = completedRows.reduce((sum, row) => sum + row.amount, 0);
  const duration = completedRows.reduce((sum, row) => sum + row.durationDays * 24 + row.durationHours, 0);

  return <AdminLayout>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display text-display-md font-700 text-ivory">Reports</h1><p className="mt-2 text-sm text-steel">Generate filtered reports from booking records</p></div><div className="flex gap-2"><button disabled={!rows.length} onClick={() => exportCsv(rows)} className="flex items-center gap-2 rounded-lg border border-graphite-line px-3 py-2 text-xs text-ivory disabled:opacity-40"><Download size={14} /> Export CSV</button><button disabled={!rows.length} onClick={() => printReport(rows, from, to, reportType)} className="flex items-center gap-2 rounded-lg bg-brass-sheen px-3 py-2 text-xs text-obsidian disabled:opacity-40"><FileText size={14} /> Generate PDF</button></div></div>
    <div className="mt-8 grid grid-cols-1 gap-3 rounded-panel border border-graphite-line bg-graphite p-5 md:grid-cols-5"><select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input"><option value="booking">Booking Report</option><option value="revenue">Revenue Report</option><option value="car">Car Performance</option><option value="customer">Customer Report</option></select><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input [color-scheme:dark]" /><input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input [color-scheme:dark]" /><select value={carId} onChange={(e) => setCarId(e.target.value)} className="input"><option value="">All cars</option>{cars.map((car) => <option key={car.id} value={car.id}>{car.brand} {car.model} {car.variant}</option>)}</select><select value={status} onChange={(e) => setStatus(e.target.value)} className="input">{statuses.map((value) => <option key={value} value={value}>{value || "All statuses"}</option>)}</select><button onClick={load} className="rounded-lg bg-brass-sheen px-4 py-2 text-sm text-obsidian md:col-span-5">Apply filters</button></div>
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5"><Summary label="Period" value={`${from} to ${to}`} /><Summary label="Completed bookings" value={String(completedRows.length)} /><Summary label="Completed revenue" value={`₹${total.toLocaleString("en-IN")}`} /><Summary label="Cancelled bookings" value={String(cancelledRows.length)} /><Summary label="Avg completed duration" value={formatDuration(Math.floor(duration / Math.max(completedRows.length, 1) / 24), Math.round(duration / Math.max(completedRows.length, 1) % 24))} /></div>
    <div className="mt-6 overflow-x-auto rounded-panel border border-graphite-line">{loading ? <p className="p-8 text-sm text-steel">Loading report…</p> : <table className="w-full text-left text-sm"><thead><tr className="border-b border-graphite-line bg-graphite text-xs text-steel"><th className="px-4 py-3">Booking ID</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Car</th><th className="px-4 py-3">Pickup</th><th className="px-4 py-3">Return</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Amount</th></tr></thead><tbody>{rows.map((row) => <tr key={row.bookingId} className="border-b border-graphite-line text-xs"><td className="px-4 py-3 font-mono text-brass">{row.bookingId.slice(0, 8)}</td><td className="px-4 py-3 text-ivory">{row.customer}</td><td className="px-4 py-3 text-steel">{row.car}</td><td className="px-4 py-3 text-steel">{new Date(row.pickupAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td><td className="px-4 py-3 text-steel">{new Date(row.returnAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td><td className="px-4 py-3 text-ivory">{formatDuration(row.durationDays, row.durationHours)}</td><td className="px-4 py-3 text-steel">{row.status}</td><td className="px-4 py-3 text-ivory">₹{row.amount.toLocaleString("en-IN")}</td></tr>)}</tbody></table>}{!loading && !rows.length && <p className="p-8 text-center text-sm text-steel">No records match the selected filters.</p>}</div>
  </AdminLayout>;
}

function Summary({ label, value }: { label: string; value: string }) { return <div className="rounded-card border border-graphite-line bg-graphite p-4"><p className="text-sm text-ivory">{value}</p><p className="mt-1 text-xs text-steel">{label}</p></div>; }
function exportCsv(rows: BookingReportRow[]) { const header = ["Booking ID", "Customer", "Car", "Pickup Date", "Pickup Time", "Return Date", "Return Time", "Duration", "Status", "Amount"]; const values = rows.map((row) => [row.bookingId, row.customer, row.car, new Date(row.pickupAt).toLocaleDateString(), new Date(row.pickupAt).toLocaleTimeString(), new Date(row.returnAt).toLocaleDateString(), new Date(row.returnAt).toLocaleTimeString(), formatDuration(row.durationDays, row.durationHours), row.status, String(row.amount)]); const csv = [header, ...values].map((line) => line.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n"); const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); link.download = "velocira-booking-report.csv"; link.click(); }
function printReport(rows: BookingReportRow[], from: string, to: string, type: string) { const report = window.open("", "_blank"); if (!report) return; const completedRows = rows.filter((row) => row.status === "COMPLETED"); const cancelledRows = rows.filter((row) => row.status === "CANCELLED"); report.document.write(`<html><head><title>Velocira ${type} report</title><style>body{font-family:Arial;padding:32px;color:#222}table{border-collapse:collapse;width:100%;font-size:11px}td,th{border:1px solid #ccc;padding:7px;text-align:left}h1{color:#9a641f}</style></head><body><h1>VELOCIRA ${type.toUpperCase()} REPORT</h1><p>Period: ${from} to ${to} | Generated: ${new Date().toLocaleString()}</p><p>Completed bookings: ${completedRows.length} | Cancelled bookings: ${cancelledRows.length} | Completed revenue: INR ${completedRows.reduce((sum, row) => sum + row.amount, 0)}</p><table><tr><th>Booking</th><th>Customer</th><th>Car</th><th>Pickup</th><th>Return</th><th>Duration</th><th>Status</th><th>Amount</th></tr>${rows.map((row) => `<tr><td>${row.bookingId}</td><td>${row.customer}</td><td>${row.car}</td><td>${row.pickupAt}</td><td>${row.returnAt}</td><td>${formatDuration(row.durationDays, row.durationHours)}</td><td>${row.status}</td><td>INR ${row.amount}</td></tr>`).join("")}</table></body></html>`); report.document.close(); report.focus(); report.print(); }
