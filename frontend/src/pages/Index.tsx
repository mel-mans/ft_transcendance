import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import MapSection from "@/components/MapSection";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import PageLayout from "@/components/PageLayout";

const Index = () => {
  return (
    <PageLayout>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <MapSection />
      <CTA />
      <Footer />
    </PageLayout>
  );
};

export default Index;
