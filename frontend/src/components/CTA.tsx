import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-6 relative">
      <div className="container mx-auto">
        <div className="glass rounded-3xl px-8 py-16 text-center relative overflow-hidden">
          
          {/* Content */}
          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm text-secondary">New Members Welcome</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Ready to Find Your Perfect Match?
            </h2>
            
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg">
              Join 1337/42 students who've already found their ideal roommates.
            </p>
            
            <Button 
              size="lg" 
              onClick={() => navigate("/signup")}
              className="gap-2 bg-primary hover:bg-black text-black hover:text-primary font-semibold px-8 rounded-full glow-primary"
            >
              Connect with 42 Intra
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
