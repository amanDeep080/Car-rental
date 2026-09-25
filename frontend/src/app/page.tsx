import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import BookingSearch from "@/components/home/BookingSearch";
import OffersBanner from "@/components/home/OffersBanner";
import FeaturedCars from "@/components/home/FeaturedCars";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import HowItWorks from "@/components/home/HowItWorks";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <BookingSearch />
        <OffersBanner />
        <FeaturedCars />
        <WhyChooseUs />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
