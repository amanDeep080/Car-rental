import { ShieldCheck, Fuel, Clock3, KeyRound, Wallet, Sparkles } from "lucide-react";

const POINTS = [
  {
    icon: ShieldCheck,
    title: "Well maintained, latest models",
    copy: "Every vehicle passes inspection before it reaches you — clean, sanitized, and road-ready.",
  },
  {
    icon: KeyRound,
    title: "No drivers, ever",
    copy: "This isn't a cab. You hold the keys and drive the entire trip yourself.",
  },
  {
    icon: Clock3,
    title: "24x7 roadside assistance",
    copy: "Our support team is reachable around the clock for the whole rental period.",
  },
  {
    icon: Wallet,
    title: "Best prices, no hidden charges",
    copy: "Transparent billing — fuel, mileage, and deposit terms are shown before you pay, not after.",
  },
  {
    icon: Fuel,
    title: "Fuel-efficient fleet",
    copy: "Unlimited KMs as per your chosen package, with clear per-km rates beyond that.",
  },
  {
    icon: Sparkles,
    title: "Multiple payment options",
    copy: "Pay online, or choose Cash on Delivery — pay in person when you pick up the car.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-28">
      <div className="container-edge">
        <p className="eyebrow mb-4">Premium Facilities</p>
        <h2 className="font-display text-display-lg font-700 text-ivory max-w-lg">
          Well maintained cars. Best prices. No hidden charges.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {POINTS.map(({ icon: Icon, title, copy }) => (
            <div
              key={title}
              className="rounded-card border border-graphite-line bg-graphite p-6 transition-colors hover:border-brass/50"
            >
              <Icon size={22} className="text-brass" strokeWidth={1.5} />
              <h3 className="mt-5 font-display text-base font-600 text-ivory">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
