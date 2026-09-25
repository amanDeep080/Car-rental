"use client";

import { useEffect, useState } from "react";
import { Bell, X, ShieldCheck, UserPlus, KeyRound, CarFront, Info } from "lucide-react";
import { subscribeToLiveNotifications, type LiveNotification } from "@/services/liveNotificationService";
import { cn } from "@/lib/cn";
import { formatDistanceToNow } from "date-fns";

const ICONS = {
  LOGIN: KeyRound,
  REGISTER: UserPlus,
  BOOKING: CarFront,
  SYSTEM: Info,
};

const COLORS = {
  LOGIN: "text-blue-400 bg-blue-400/10",
  REGISTER: "text-green-400 bg-green-400/10",
  BOOKING: "text-brass bg-brass/10",
  SYSTEM: "text-steel bg-steel/10",
};

export default function AdminNotificationPanel() {
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    const cleanup = subscribeToLiveNotifications((n) => {
      setNotifications((prev) => [n, ...prev].slice(0, 50));
      setHasNew(true);

      // Play a subtle sound or use Browser Notification API if needed
    });
    return cleanup;
  }, []);

  useEffect(() => {
    if (isOpen) setHasNew(false);
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-graphite-line bg-graphite transition-colors hover:border-brass"
      >
        <Bell size={18} className="text-steel" />
        {hasNew && (
          <span className="absolute right-2 top-2 h-2.5 w-2.5 animate-pulse rounded-full bg-brass" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-obsidian/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-[70] w-full max-w-sm border-l border-graphite-line bg-graphite shadow-2xl transition-transform duration-500 ease-premium sm:w-80",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-graphite-line px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-brass" />
            <h2 className="font-display text-sm font-700 text-ivory tracking-tight">Live Activity</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-steel hover:text-ivory">
            <X size={20} />
          </button>
        </div>

        <div className="h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 scrollbar-hide">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-graphite-raised">
                <Bell size={20} className="text-steel" />
              </div>
              <p className="text-xs text-steel">No live activity detected yet.</p>
              <p className="mt-1 text-[10px] text-steel/60">Real-time alerts will appear here as they happen.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((n, i) => {
                const Icon = ICONS[n.type] || Info;
                return (
                  <div key={i} className="group relative flex gap-3 rounded-xl border border-graphite-line bg-graphite-raised/30 p-4 transition-colors hover:bg-graphite-raised/50">
                    <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg", COLORS[n.type])}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-600 text-ivory">{n.title}</p>
                        <span className="text-[9px] text-steel">
                          {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-steel">{n.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
