import { Globe2, CalendarDays, Clock } from "lucide-react";

const OFFERS = [
  { icon: Globe2, label: "NRI Special Offer", value: "10% OFF", sub: "On all bookings", code: "NRI10" },
  { icon: CalendarDays, label: "Long Weekend Offer", value: "15% OFF", sub: "On 3 days & above bookings", code: "WEEKEND15" },
  { icon: Clock, label: "Early Bird Offer", value: "5% OFF", sub: "On advance bookings", code: "EARLYBIRD5" },
];

export default function OffersBanner() {
  return (
    <section className="border-t border-graphite-line py-20">
      <div className="container-edge">
        <p className="eyebrow mb-4">Amazing Offers</p>
        <h2 className="font-display text-display-md font-700 text-ivory">Drive more, pay less.</h2>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {OFFERS.map(({ icon: Icon, label, value, sub, code }) => (
            <div key={code} className="rounded-panel border border-graphite-line bg-graphite p-6">
              <Icon size={20} className="text-brass" strokeWidth={1.5} />
              <p className="mt-4 text-xs uppercase tracking-wide text-steel">{label}</p>
              <p className="mt-2 font-display text-3xl font-800 text-brass">{value}</p>
              <p className="mt-1 text-sm text-steel">{sub}</p>
              <p className="mt-4 font-mono text-[11px] text-steel">
                Use code <span className="text-ivory">{code}</span> at checkout
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
