import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGlitch } from "react-powerglitch";

const CTA = () => {
  const navigate = useNavigate();
  const ctaGlitch = useGlitch({
    playMode: "hover",
  });

  return (
    <section className="py-24 px-6 relative">
      <div className="container mx-auto">
        <div className="bg-transparent border-0 rounded-3xl px-8 py-16 text-center relative overflow-hidden">
          
          {/* Content */}
          <div className="relative z-10">    
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-secondary">
              <span className="glitch-text" data-text="Ready to Find Your">
                Ready to Find Your
              </span>
              <br />
              <span className="glitch-text" data-text="Perfect Match?">
                Perfect Match?
              </span>
            </h2>
            <Button 
              size="lg" 
              ref={ctaGlitch.ref}
              onClick={() => navigate("/signup")}
              className="mt-6 group gap-2 bg-primary hover:bg-black text-black hover:text-primary font-semibold px-8 rounded-none glow-primary"
            >
              Connect with 42 Intra
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
