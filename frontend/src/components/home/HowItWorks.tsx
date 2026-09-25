const STEPS = [
  { n: "01", title: "Choose Your Car", copy: "Browse the fleet by category, budget, or the trip you have in mind." },
  { n: "02", title: "Select Your Dates", copy: "Tell us when you need it — down to the pickup hour." },
  { n: "03", title: "Verify & Book", copy: "Upload your license, confirm details, and pay securely." },
  { n: "04", title: "Pick Up", copy: "Meet your car at the branch. Inspect it together, then it's yours." },
  { n: "05", title: "Drive", copy: "No driver, no dispatch — just you, the keys, and the road." },
  { n: "06", title: "Return", copy: "Bring it back to the agreed location. We inspect, you're done." },
];

export default function HowItWorks() {
  return (
    <section className="border-t border-graphite-line py-28">
      <div className="container-edge">
        <p className="eyebrow mb-4">The process</p>
        <h2 className="font-display text-display-lg font-700 text-ivory max-w-xl">
          Search, choose, drive. Nothing in between.
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="border-t border-graphite-line pt-6">
              <span className="font-mono text-sm text-brass">{step.n}</span>
              <h3 className="mt-3 font-display text-lg font-600 text-ivory">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel">{step.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
