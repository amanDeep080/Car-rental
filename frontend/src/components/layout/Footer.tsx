import Link from "next/link";
import { Phone } from "lucide-react";

const COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Locations", href: "/locations" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Rent",
    links: [
      { label: "Explore Fleet", href: "/cars" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Offers", href: "/offers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Rental Agreement", href: "/legal/rental-agreement" },
      { label: "Terms & Conditions", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Cancellation Policy", href: "/legal/cancellation" },
      { label: "Security Deposit Policy", href: "/legal/deposit" },
    ],
  },
];

const CONTACT_NUMBERS = ["91490 89571", "97559 75765", "96712 23901", "62301 92122"];

export default function Footer() {
  return (
    <footer className="border-t border-graphite-line bg-obsidian-soft">
      <div className="container-edge py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brass-sheen text-obsidian font-display font-800 text-sm">
                W
              </span>
              <span className="font-display text-lg font-700 text-ivory">
                WHEELS<span className="text-brass">_</span>ON<span className="text-brass">_</span>RENTALS
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-steel">Drive it. Love it. Own the journey.</p>

            <div className="mt-5 space-y-1.5">
              {CONTACT_NUMBERS.map((n) => (
                <a
                  key={n}
                  href={`tel:+91${n.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 text-xs text-steel transition-colors hover:text-brass"
                >
                  <Phone size={12} /> {n}
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-brass">{col.title}</h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-steel transition-colors hover:text-ivory">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-graphite-line pt-6 text-xs text-steel md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Wheels On Rentals. Self-drive rentals — no drivers, no dispatch.</p>
          <p>Your journey, your way.</p>
        </div>
      </div>
    </footer>
  );
}
