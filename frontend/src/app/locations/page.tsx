import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function LocationsPage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-20">
        <div className="container-edge">
          <h1 className="font-display text-4xl font-700 text-ivory mb-6">Our Locations</h1>
          <p className="text-steel mb-12 max-w-2xl text-lg">
            Find Wheels on Rentals at convenient locations across the city. We are expanding rapidly to bring premium mobility closer to you.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {["Downtown Hub", "Airport Terminal", "Tech Park South"].map((loc) => (
              <div key={loc} className="rounded-2xl border border-graphite-line bg-obsidian-soft p-8">
                <h3 className="text-xl font-600 text-ivory mb-2">{loc}</h3>
                <p className="text-steel text-sm mb-4">Open 24/7 • Premium Fleet Available</p>
                <div className="text-brass text-sm font-500">View on Maps →</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
