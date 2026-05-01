import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useGlitch } from "react-powerglitch";
// import HeroImageCube from "@/components/HeroImageCube";
// import type { CubeFaceCard } from "@/components/HeroImageCube";
import { useNavigate } from "react-router-dom";

// const cubeFaces: CubeFaceCard[] = [
//   { kind: "listing", title: "Cozy Apt", subtitle: "Paris 13e · WiFi", meta: "€650/mo · 2/3 spots" },
//   { kind: "roommate", title: "Alex, 24", subtitle: "Night owl · Gamer", meta: "Move-in Feb 2026" },
//   { kind: "listing", title: "Shared House", subtitle: "Paris 14e · Garden", meta: "€580/mo · 4/5 spots" },
//   { kind: "roommate", title: "Sofia, 22", subtitle: "Early bird · Cooks", meta: "Budget €500-700/mo" },
//   { kind: "listing", title: "Modern Loft", subtitle: "Canal area · Secure", meta: "€710/mo · 2/4 spots" },
//   { kind: "roommate", title: "Marcus, 26", subtitle: "Social · Clean", meta: "Move-in Mar 2026" },
// ];

const Hero = () => {
  const navigate = useNavigate();
  const getStartedGlitch = useGlitch({
    playMode: "hover",
  });

  return (
    <section className="min-h-screen flex flex-col items-center justify-center pt-28 sm:pt-32 pb-16 sm:pb-20 relative overflow-hidden">
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="flex justify-center">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">For 42 Network Students</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
              <span className="glitch-text text-foreground" data-text="Find Your Perfect">
                Find Your Perfect
              </span>
              <br />
              <span className="glitch-text text-foreground" data-text="Roommates">
                Roommates
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 mb-8 sm:mb-10">
              Connect with fellow 42 students to find compatible roommates and affordable housing near your campus.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <Button 
                size="lg" 
                ref={getStartedGlitch.ref}
                onClick={() => navigate("/signup")}
                className="group w-full sm:w-auto bg-primary hover:bg-black text-black hover:text-primary border-black hover:border-black font-semibold px-8 rounded-full"
              >
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <Button 
                size="lg" 
                onClick={() => navigate("/listings")}
                className="w-full sm:w-auto bg-0 hover:bg-secondary text-secondary hover:text-black border-0 hover:border-0 font-semibold px-8 rounded-full"
              >
                Browse Listings
              </Button>
            </div>
          </div>

          {/* Right: Carousel Preview - Disabled for testing
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl blur-2xl opacity-30" />
            
            <div className="relative">
              <HeroImageCube faces={cubeFaces} />

              <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-primary/15 blur-xl" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-secondary/15 blur-xl" />
            </div>
          </div>
          */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
