import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function HowItWorksPage() {
  const steps = [
    { title: "Browse & Select", desc: "Choose from our curated fleet of premium vehicles." },
    { title: "Book Instantly", desc: "Select your dates and complete the paperless booking." },
    { title: "Pick Up", desc: "Collect your car from the nearest hub or get it delivered." },
    { title: "Enjoy the Ride", desc: "Drive with peace of mind and 24/7 roadside assistance." }
  ];

  return (
    <>
      <Header />
      <main className="pt-32 pb-20">
        <div className="container-edge">
          <h1 className="font-display text-4xl font-700 text-ivory mb-6 text-center">How It Works</h1>
          <p className="text-steel mb-16 max-w-2xl mx-auto text-lg text-center">
            Renting a premium car has never been this seamless. Follow our simple process to get behind the wheel.
          </p>

          <div className="grid gap-12 md:grid-cols-4">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-brass-sheen text-obsidian flex items-center justify-center font-bold text-xl mx-auto mb-6">
                  {i + 1}
                </div>
                <h3 className="text-xl font-600 text-ivory mb-3">{step.title}</h3>
                <p className="text-steel text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
