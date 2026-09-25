"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { getAnalyticsData, type AnalyticsData } from "@/services/adminService";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Download, FileText, RefreshCw } from "lucide-react";
import { formatDuration } from "@/types/booking";
import { subscribeToLiveNotifications } from "@/services/liveNotificationService";

export default function AdminAnalyticsPage() {
  const ready = useAdminGuard();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [range, setRange] = useState("30");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  useEffect(() => {
    if (!ready) return;
    let hasLoaded = false;
    const load = () => {
      const end = new Date();
      const start = new Date();
      if (range === "custom") {
        if (!customFrom || !customTo) return;
        start.setTime(new Date(`${customFrom}T00:00:00`).getTime());
        end.setTime(new Date(`${customTo}T23:59:59.999`).getTime());
      } else {
        start.setDate(start.getDate() - Number(range));
      }
      if (!hasLoaded) setLoading(true);
      getAnalyticsData(start.toISOString(), end.toISOString())
        .then((value) => { setData(value); setError(false); })
        .catch(() => setError(true))
        .finally(() => { hasLoaded = true; setLoading(false); });
    };
    load();
    const cleanup = subscribeToLiveNotifications(load);
    const interval = setInterval(load, 5000);
    return () => { cleanup(); clearInterval(interval); };
  }, [ready, range, customFrom, customTo]);

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="font-display text-display-md font-700 text-ivory">Analytics & Reports</h1><p className="mt-2 text-sm text-steel">Real booking and revenue performance</p></div>
        <div className="flex flex-wrap gap-2">
          <select value={range} onChange={(e) => setRange(e.target.value)} className="input w-auto"><option value="1">Today</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="365">This year</option><option value="custom">Custom range</option></select>
          {range === "custom" && <><input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="input [color-scheme:dark]" /><input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="input [color-scheme:dark]" /></>}
          {data && <><button onClick={() => exportCsv(data)} className="flex items-center gap-2 rounded-lg border border-graphite-line px-3 py-2 text-xs text-ivory"><Download size={14} /> Export CSV</button><button onClick={() => printReport(data)} className="flex items-center gap-2 rounded-lg bg-brass-sheen px-3 py-2 text-xs text-obsidian"><FileText size={14} /> Generate PDF</button></>}
        </div>
      </div>

      {loading && <p className="mt-6 text-sm text-steel">Loading…</p>}
      {!loading && error && <div className="mt-6 flex items-center gap-3 text-sm text-signal-booked"><RefreshCw size={15} /> Couldn&apos;t load analytics from the server.</div>}

      {data && (
        <div className="mt-8 space-y-10">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MiniStat label="Revenue" value={`₹${data.revenue.toLocaleString("en-IN")}`} />
            <MiniStat label="Bookings" value={data.bookings} />
            <MiniStat label="Avg booking value" value={`₹${data.averageBookingValue.toLocaleString("en-IN")}`} />
            <MiniStat label="Rental duration" value={formatDuration(Math.floor(data.averageRentalHours / 24), Math.round(data.averageRentalHours % 24))} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Monthly Revenue">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} />
                <XAxis dataKey="period" stroke="#8B8A8F" fontSize={11} />
                <YAxis stroke="#8B8A8F" fontSize={11} />
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#C98A3B" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Daily Revenue">
            <ResponsiveContainer width="100%" height={280}><BarChart data={data.dailyRevenue}><CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} /><XAxis dataKey="period" hide /><YAxis stroke="#8B8A8F" fontSize={11} /><Tooltip /><Bar dataKey="revenue" fill="#6D9E9B" /></BarChart></ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Weekly Revenue">
            <ResponsiveContainer width="100%" height={280}><BarChart data={data.weeklyRevenue}><CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} /><XAxis dataKey="period" stroke="#8B8A8F" fontSize={11} /><YAxis stroke="#8B8A8F" fontSize={11} /><Tooltip formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]} /><Bar dataKey="revenue" fill="#B45E5E" /></BarChart></ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Booking Trend"><ResponsiveContainer width="100%" height={280}><AreaChart data={data.bookingTrend}><CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} /><XAxis dataKey="period" hide /><YAxis allowDecimals={false} stroke="#8B8A8F" fontSize={11} /><Tooltip /><Area type="monotone" dataKey="bookingCount" stroke="#D8A85C" fill="#D8A85C" fillOpacity={0.2} /></AreaChart></ResponsiveContainer></ChartCard>
          <ChartCard title="Booking Status"><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={data.bookingStatuses} dataKey="count" nameKey="status" innerRadius={65} outerRadius={95} label={(entry) => `${entry.status} ${entry.count}`}><Cell fill="#C98A3B" /><Cell fill="#6D9E9B" /><Cell fill="#D8A85C" /><Cell fill="#B45E5E" /><Cell fill="#8B8A8F" /></Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></ChartCard>
          <ChartCard title="Rental Duration Mix"><ResponsiveContainer width="100%" height={280}><PieChart><Pie data={data.durationBuckets} dataKey="count" nameKey="status" innerRadius={55} outerRadius={90} label={(entry) => `${entry.status}: ${entry.count}`}><Cell fill="#6D9E9B" /><Cell fill="#C98A3B" /><Cell fill="#D8A85C" /><Cell fill="#B45E5E" /></Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></ChartCard>
          <ChartCard title="Popular Pickup Times"><ResponsiveContainer width="100%" height={280}><BarChart data={data.pickupTimes}><CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} /><XAxis dataKey="status" stroke="#8B8A8F" fontSize={10} /><YAxis allowDecimals={false} stroke="#8B8A8F" fontSize={11} /><Tooltip /><Bar dataKey="count" fill="#8B8A8F" /></BarChart></ResponsiveContainer></ChartCard>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Revenue by Car">
              <div className="space-y-3">
                {data.carPerformance.map((car, i) => (
                  <div key={car.carId} className="flex items-center justify-between text-sm">
                    <span className="text-steel"><span className="mr-2 font-mono text-xs text-brass">{i + 1}</span>
                      {car.label}
                    </span>
                    <span className="text-ivory">₹{car.revenue.toLocaleString("en-IN")} · {car.bookingCount}</span>
                  </div>
                ))}
                {data.carPerformance.length === 0 && <p className="text-sm text-steel">No booking data yet.</p>}
              </div>
            </ChartCard>
            <ChartCard title="Rental Duration & Peak Times">
              <div className="space-y-4 text-sm"><Metric label="Total rental hours" value={`${data.totalRentalHours.toLocaleString("en-IN")} hours`} /><Metric label="Average duration" value={formatDuration(Math.floor(data.averageRentalHours / 24), Math.round(data.averageRentalHours % 24))} /><Metric label="Popular pickup day" value={data.peaks.pickupDay} /><Metric label="Popular pickup time" value={data.peaks.pickupTime} /><Metric label="Busiest month" value={data.peaks.busiestMonth} /><Metric label="Previous period revenue" value={`₹${data.previousPeriodRevenue.toLocaleString("en-IN")}`} /></div>
            </ChartCard>
          </div>
          <ChartCard title="Car Utilization"><ResponsiveContainer width="100%" height={320}><BarChart layout="vertical" data={data.utilization} margin={{ left: 30, right: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" horizontal={false} /><XAxis type="number" allowDecimals={false} stroke="#8B8A8F" fontSize={11} /><YAxis type="category" dataKey="label" width={120} stroke="#8B8A8F" fontSize={10} /><Tooltip formatter={(value: number) => [`${value} hours`, "Rental time"]} /><Bar dataKey="rentalHours" fill="#6D9E9B" /></BarChart></ResponsiveContainer></ChartCard>
          <ChartCard title="Top Performing Cars"><div className="grid grid-cols-1 gap-3 md:grid-cols-2">{data.carPerformance.slice(0, 6).map((car, i) => <div key={car.carId} className="rounded-card border border-graphite-line bg-graphite-raised/30 p-4"><p className="text-ivory"><span className="mr-2 text-brass">{i + 1}.</span>{car.label}</p><p className="mt-2 text-xs text-steel">Revenue ₹{car.revenue.toLocaleString("en-IN")} · {car.bookingCount} bookings · {formatDuration(Math.floor(car.rentalHours / 24), car.rentalHours % 24)}</p></div>)}</div></ChartCard>
        </div>
      )}
    </AdminLayout>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="flex justify-between border-b border-graphite-line pb-2"><span className="text-steel">{label}</span><span className="text-ivory">{value}</span></div>; }

function exportCsv(data: AnalyticsData) {
  const rows = [["Car", "Bookings", "Rental Hours", "Revenue"], ...data.carPerformance.map((car) => [car.label, String(car.bookingCount), String(car.rentalHours), String(car.revenue)])];
  const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = "velocira-analytics.csv"; link.click(); URL.revokeObjectURL(url);
}

function printReport(data: AnalyticsData) {
  const report = window.open("", "_blank");
  if (!report) return;
  report.document.write(`<html><head><title>Velocira Analytics Report</title><style>body{font-family:Arial;padding:32px;color:#222}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px;text-align:left}h1{color:#9a641f}</style></head><body><h1>VELOCIRA Analytics Report</h1><p>Period: ${data.from} to ${data.to}</p><h2>Summary</h2><p>Total bookings: ${data.bookings} | Revenue: INR ${data.revenue} | Average duration: ${data.averageRentalHours.toFixed(1)} hours</p><table><tr><th>Car</th><th>Bookings</th><th>Rental hours</th><th>Revenue</th></tr>${data.carPerformance.map((car) => `<tr><td>${car.label}</td><td>${car.bookingCount}</td><td>${car.rentalHours}</td><td>INR ${car.revenue}</td></tr>`).join("")}</table></body></html>`); report.document.close(); report.focus(); report.print();
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-card border border-graphite-line bg-graphite p-4">
      <p className="font-display text-lg font-700 text-ivory">{value}</p>
      <p className="mt-1 text-xs text-steel">{label}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-panel border border-graphite-line bg-graphite p-6">
      <h2 className="mb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-brass">{title}</h2>
      {children}
    </div>
  );
}
