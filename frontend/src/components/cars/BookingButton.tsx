"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { isAuthenticated } from "@/services/authService";

interface BookingButtonProps {
  carSlug: string;
  status: string;
}

export default function BookingButton({ carSlug, status }: BookingButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unavailable = status !== "AVAILABLE";

  const handleBooking = (e: React.MouseEvent) => {
    e.preventDefault();
    if (unavailable) return;

    const onBehalfOf = searchParams.get("onBehalfOf");
    const checkoutUrl = `/checkout?carSlug=${carSlug}${onBehalfOf ? `&onBehalfOf=${onBehalfOf}` : ""}`;

    if (!isAuthenticated()) {
      router.push(`/login?redirect=${encodeURIComponent(checkoutUrl)}`);
    } else {
      router.push(checkoutUrl);
    }
  };

  return (
    <button
      onClick={handleBooking}
      disabled={unavailable}
      className={`mt-6 block w-full rounded-full py-3.5 text-center text-sm font-medium transition-transform duration-300 ${
        unavailable
          ? "cursor-not-allowed bg-graphite-raised text-steel"
          : "bg-brass-sheen text-obsidian hover:scale-[1.02]"
      }`}
    >
      {unavailable ? status.replace("_", " ") : "Book This Car"}
    </button>
  );
}
