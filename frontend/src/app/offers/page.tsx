import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function OffersPage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-20">
        <div className="container-edge">
          <h1 className="font-display text-4xl font-700 text-ivory mb-6 text-center">Special Offers</h1>
          <p className="text-steel mb-12 max-w-2xl mx-auto text-lg text-center">
            Exclusive deals for our premium members. Drive more, save more.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-dashed border-brass/30 bg-brass/5 p-10 text-center">
              <span className="text-brass font-bold text-sm tracking-widest uppercase mb-4 block">First Ride</span>
              <h3 className="text-2xl font-700 text-ivory mb-2">20% OFF</h3>
              <p className="text-steel mb-6">Use code <span className="text-ivory font-mono font-bold">WELCOME20</span> on your first booking.</p>
              <button className="bg-brass-sheen text-obsidian px-6 py-2 rounded-full font-600 text-sm">Claim Offer</button>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-graphite-line bg-obsidian-soft p-10 text-center">
              <span className="text-steel font-bold text-sm tracking-widest uppercase mb-4 block">Weekend Special</span>
              <h3 className="text-2xl font-700 text-ivory mb-2">Flat ₹1000 OFF</h3>
              <p className="text-steel mb-6">Available on all SUVs for 48h+ rentals.</p>
              <button className="border border-graphite-line text-ivory px-6 py-2 rounded-full font-600 text-sm">View Details</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
