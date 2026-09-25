import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { RENTAL_TERMS, AFFIDAVIT_INTRO } from "@/lib/rentalTerms";

export const metadata = { title: "Rental Agreement" };

export default function RentalAgreementPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-obsidian pb-24 pt-32">
        <div className="container-edge max-w-2xl">
          <p className="eyebrow mb-3">Legal</p>
          <h1 className="font-display text-display-md font-700 text-ivory">Rental Agreement</h1>
          <p className="mt-4 text-sm leading-relaxed text-steel">{AFFIDAVIT_INTRO}</p>

          <p className="mt-8 text-sm leading-relaxed text-steel">
            Before completing any booking, you&apos;ll fill in and digitally accept this agreement — your name,
            address, driving license, ID proof, and the per-day kilometer limit and rent for your specific booking —
            in place of a physical signature and thumbprint.
          </p>

          <h2 className="mt-10 font-display text-lg font-600 text-ivory">Terms & Conditions</h2>
          <ol className="mt-5 space-y-4 text-sm leading-relaxed text-steel">
            {RENTAL_TERMS.map((term, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 font-mono text-brass">{i + 1}.</span>
                <span>{term}</span>
              </li>
            ))}
          </ol>

          <p className="mt-10 text-xs text-steel">
            This page is a plain transcription of our standard rental agreement for reference. It does not replace
            legal advice — for questions about your specific booking, contact us directly.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
