"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { getDashboardStats, getRecentActivity, getAnalyticsOverview, type AdminDashboardStats, type AnalyticsOverview, type AuditLogEntry } from "@/services/adminService";
import { IndianRupee, CalendarRange, Car, Users, AlertTriangle, TrendingUp, MapPin, Activity, Clock, CheckCircle } from "lucide-react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { subscribeToLiveNotifications } from "@/services/liveNotificationService";

export default function AdminDashboardPage() {
  const ready = useAdminGuard();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [activity, setActivity] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    Promise.all([
      getDashboardStats(),
      getAnalyticsOverview(),
      getRecentActivity(0, 8)
    ])
      .then(([s, a, act]) => {
        setStats(s);
        setAnalytics(a);
        setActivity(act?.content || []);
      })
      .catch((err) => {
        console.error("Dashboard data load failed", err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!ready) return;
    loadData();

    // Live update subscription
    const cleanup = subscribeToLiveNotifications((n) => {
      // Whenever ANY live notification happens, we refresh the dashboard data
      // This makes it feel "real-time" without aggressive polling
      loadData();
    });

    // Fallback polling (less frequent since we have live updates)
    const interval = setInterval(loadData, 5000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [ready, loadData]);

  if (!ready) return null;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-display-md font-700 text-ivory">Master Dashboard</h1>
        <div className="flex items-center gap-4">
           <div className="hidden sm:flex items-center gap-2 rounded-full border border-graphite-line px-3 py-1 text-[10px] text-steel">
            <Clock size={12} /> Last updated: {new Date().toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-brass/10 px-3 py-1 text-xs text-brass">
            <TrendingUp size={14} /> Live Stats
          </div>
        </div>
      </div>

      {loading && <p className="mt-6 text-sm text-steel">Synchronizing system data…</p>}

      {stats && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`} />
            <StatCard icon={IndianRupee} label="Today's Revenue" value={`₹${stats.todayRevenue.toLocaleString("en-IN")}`} accent />
            <StatCard icon={IndianRupee} label="This Week" value={`₹${(stats.weekRevenue ?? 0).toLocaleString("en-IN")}`} />
            <StatCard icon={IndianRupee} label="This Month" value={`₹${(stats.monthRevenue ?? 0).toLocaleString("en-IN")}`} />
            <StatCard icon={CalendarRange} label="Total Bookings" value={stats.totalBookings.toLocaleString("en-IN")} />
            <StatCard icon={CalendarRange} label="Today's Bookings" value={stats.todayBookings.toLocaleString("en-IN")} />
            <StatCard icon={Activity} label="Active Rentals" value={(stats.activeRentals ?? 0).toLocaleString("en-IN")} />
            <StatCard icon={CheckCircle} label="Completed Rentals" value={(stats.completedRentals ?? 0).toLocaleString("en-IN")} />
            <StatCard icon={AlertTriangle} label="Cancelled" value={(stats.cancelledBookings ?? 0).toLocaleString("en-IN")} urgent />
            <StatCard icon={Car} label="Total Cars" value={(stats.totalCars ?? 0).toLocaleString("en-IN")} />
            <StatCard icon={Car} label="Available Cars" value={stats.availableCars.toLocaleString("en-IN")} />
            <StatCard icon={Car} label="Currently Booked" value={(stats.currentlyBookedCars ?? 0).toLocaleString("en-IN")} accent />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column: Charts & Popularity */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-panel border border-graphite-line bg-graphite p-6 shadow-sm">
                <h2 className="mb-6 font-mono text-[11px] uppercase tracking-widest text-brass">Revenue Projection (6 Months)</h2>
                <div className="h-[300px] w-full">
                  {analytics ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} />
                        <XAxis dataKey="period" stroke="#8B8A8F" fontSize={11} tickMargin={10} />
                        <YAxis stroke="#8B8A8F" fontSize={11} />
                        <Tooltip
                          contentStyle={{ background: "#201F22", border: "1px solid #2A2A2E", borderRadius: 8, fontSize: 12 }}
                          labelStyle={{ color: "#EDEAE4" }}
                          itemStyle={{ color: "#C98A3B" }}
                          formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#C98A3B" strokeWidth={2.5} dot={{ fill: "#C98A3B", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-steel">Loading charts…</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-panel border border-graphite-line bg-graphite p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-mono text-[11px] uppercase tracking-widest text-brass">Fleet Leaderboard</h2>
                    <Link href="/admin/analytics" className="text-[10px] text-steel hover:text-ivory uppercase">Details</Link>
                  </div>
                  <div className="space-y-4">
                    {analytics?.topCars.slice(0, 4).map((car) => (
                      <div key={car.carId} className="group">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-ivory group-hover:text-brass transition-colors">{car.label}</span>
                          <span className="text-steel">{car.bookingCount} bookings</span>
                        </div>
                        <div className="h-1 w-full bg-graphite-raised rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brass/60 transition-all duration-500"
                            style={{ width: `${(car.bookingCount / (analytics.topCars[0]?.bookingCount || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-panel border border-graphite-line bg-graphite p-6">
                   <h2 className="mb-6 font-mono text-[11px] uppercase tracking-widest text-brass">Hot Locations</h2>
                   <div className="space-y-4">
                    {analytics?.topLocations.map((loc) => (
                      <div key={loc.city} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-graphite-raised text-brass">
                          <MapPin size={14} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-ivory">{loc.city}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-brass font-mono">{loc.bookingCount}</p>
                        </div>
                      </div>
                    ))}
                   </div>
                </div>
              </div>
            </div>

            {/* Right Column: Activity & Status */}
            <div className="space-y-6">
              <div className="rounded-panel border border-graphite-line bg-graphite p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-mono text-[11px] uppercase tracking-widest text-brass">Recent Activity</h2>
                  <Activity size={14} className="text-steel" />
                </div>
                <div className="max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-graphite-raised scrollbar-track-transparent">
                  <div className="space-y-5">
                    {activity.length > 0 ? activity.map((log) => {
                      let logHref = "#";
                      if (log.entityType === "USER" || log.entityType === "CUSTOMER") {
                        logHref = `/admin/customers/${log.entityId || ""}`;
                      } else if (log.entityType === "CAR") {
                        logHref = "/admin/cars";
                      } else if (log.entityType === "BOOKING") {
                        logHref = "/admin/bookings";
                      } else if (log.entityType === "DOCUMENT") {
                        logHref = "/admin/documents";
                      }

                      const logId = log.id || Math.random().toString();
                      return (
                        <Link
                          key={logId}
                          href={logHref || "#"}
                          className="group relative block pl-6 before:absolute before:left-0 before:top-1.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-graphite-raised hover:bg-graphite-raised/20 p-1 -ml-1 rounded-lg transition-colors"
                        >
                          <p className="text-xs text-ivory font-medium leading-relaxed group-hover:text-brass transition-colors">
                            {formatAction(log.action)} {log.metadata ? (
                              <span className="text-brass ml-1">
                                {log.metadata.length > 30 ? log.metadata.substring(0, 30) + "..." : log.metadata}
                              </span>
                            ) : (
                              <><span className="text-steel ml-1">on</span> {log.entityType.toLowerCase()}</>
                            )}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-steel uppercase tracking-tighter">
                            <span className="font-600">{log.performedBy || "System"}</span>
                            <span>•</span>
                            <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                          </div>
                        </Link>
                      );
                    }) : (
                      <p className="text-xs text-steel py-4 text-center">No recent activity</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-panel border border-graphite-line bg-graphite p-6">
                <h2 className="mb-6 font-mono text-[11px] uppercase tracking-widest text-brass">System Status</h2>
                <div className="space-y-4">
                  <StatusRow label="Fleet Utilization" value={`${analytics?.fleetUtilizationPercent ?? 0}%`} progress={analytics?.fleetUtilizationPercent ?? 0} />
                  <StatusRow label="Customer Retention" value={`${Math.round((analytics?.repeatCustomers || 0) / (stats.totalCustomers || 1) * 100)}%`} progress={Math.round((analytics?.repeatCustomers || 0) / (stats.totalCustomers || 1) * 100)} />
                  <div className="pt-4 border-t border-graphite-line flex items-center justify-between">
                    <span className="text-xs text-steel">Pending Checks</span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-signal-booked text-[10px] font-bold text-obsidian">
                      {stats.pendingVerifications + stats.pendingInspections}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function formatAction(action: string) {
  return action.replace(/_/g, ' ').toLowerCase()
    .replace(/^\w/, c => c.toUpperCase());
}

function StatusRow({ label, value, progress }: { label: string; value: string; progress: number }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-2">
        <span className="text-steel">{label}</span>
        <span className="text-ivory font-mono">{value}</span>
      </div>
      <div className="h-1 w-full bg-graphite-raised rounded-full overflow-hidden">
        <div
          className="h-full bg-brass transition-all duration-1000"
          style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  urgent,
}: {
  icon: any;
  label: string;
  value: string;
  accent?: boolean;
  urgent?: boolean;
}) {
  return (
    <div className="rounded-card border border-graphite-line bg-graphite p-5">
      <Icon size={16} className={urgent ? "text-signal-booked" : accent ? "text-brass" : "text-steel"} strokeWidth={1.6} />
      <p className="mt-3 font-display text-xl font-700 text-ivory">{value}</p>
      <p className="mt-1 text-xs text-steel">{label}</p>
    </div>
  );
}
