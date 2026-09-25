import { cn } from "@/lib/cn";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-signal-pending/10 text-signal-pending",
  AWAITING_VERIFICATION: "bg-signal-pending/10 text-signal-pending",
  AWAITING_PAYMENT: "bg-signal-pending/10 text-signal-pending",
  CONFIRMED: "bg-signal-available/10 text-signal-available",
  READY_FOR_PICKUP: "bg-signal-available/10 text-signal-available",
  ACTIVE: "bg-brass/10 text-brass",
  RETURNED: "bg-steel/10 text-steel",
  INSPECTION_PENDING: "bg-signal-pending/10 text-signal-pending",
  COMPLETED: "bg-signal-available/10 text-signal-available",
  CANCELLED: "bg-signal-booked/10 text-signal-booked",
  REFUND_PENDING: "bg-signal-pending/10 text-signal-pending",
  REFUNDED: "bg-steel/10 text-steel",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide", STATUS_STYLES[status] ?? "bg-steel/10 text-steel")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
