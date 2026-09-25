"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getMyNotifications, markNotificationRead, type Notification } from "@/services/notificationService";
import { Bell, BellRing } from "lucide-react";

export default function NotificationsPage() {
  const ready = useAuthGuard();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    getMyNotifications().then(setNotifications).catch(() => setNotifications([])).finally(() => setLoading(false));
  }, [ready]);

  async function handleRead(id: string) {
    await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  if (!ready) return null;

  return (
    <DashboardLayout>
      <h1 className="font-display text-display-md font-700 text-ivory">Notifications</h1>

      {loading && <p className="mt-6 text-sm text-steel">Loading…</p>}

      {!loading && notifications.length === 0 && (
        <div className="mt-8 rounded-panel border border-dashed border-graphite-line py-20 text-center">
          <Bell size={24} className="mx-auto text-steel" />
          <p className="mt-3 text-sm text-ivory">You&apos;re all caught up.</p>
          <p className="mt-1 text-xs text-steel">
            Booking confirmations, pickup reminders, and offers will show up here.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => !n.read && handleRead(n.id)}
            className={`flex w-full items-start gap-3 rounded-card border p-4 text-left transition-colors ${
              n.read ? "border-graphite-line bg-graphite" : "border-brass/30 bg-brass/5"
            }`}
          >
            {n.read ? (
              <Bell size={16} className="mt-0.5 flex-shrink-0 text-steel" />
            ) : (
              <BellRing size={16} className="mt-0.5 flex-shrink-0 text-brass" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ivory">{n.title}</p>
              {n.body && <p className="mt-0.5 text-xs text-steel">{n.body}</p>}
              <p className="mt-1 text-xs text-steel">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          </button>
        ))}
      </div>
    </DashboardLayout>
  );
}
