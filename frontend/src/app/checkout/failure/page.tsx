import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { XCircle } from "lucide-react";

export default function CheckoutFailurePage() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen items-center justify-center bg-obsidian px-6 pt-20">
        <div className="w-full max-w-md rounded-panel border border-graphite-line bg-graphite p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-signal-booked/10">
            <XCircle size={28} className="text-signal-booked" />
          </div>
          <h1 className="mt-5 font-display text-xl font-700 text-ivory">
            We couldn&apos;t complete that booking
          </h1>
          <p className="mt-2 text-sm text-steel">
            The car may have just been booked by someone else for an overlapping window, or your session may have
            expired. No charge was made.
          </p>
          <Link
            href="/cars"
            className="mt-8 block rounded-full bg-brass-sheen py-3 text-sm font-medium text-obsidian transition-transform hover:scale-[1.01]"
          >
            Back to Fleet
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
