import { UserCheck, Search, MessageSquare, Home } from "lucide-react";

const steps = [
  {
    icon: UserCheck,
    title: "Connect with 42",
    description: "Sign in using your 42 Intra account.",
    step: "01",
  },
  {
    icon: Search,
    title: "Browse & Filter",
    description: "Search by location, budget, and preferences.",
    step: "02",
  },
  {
    icon: MessageSquare,
    title: "Chat & Connect",
    description: "Message potential roommates directly.",
    step: "03",
  },
  {
    icon: Home,
    title: "Move In",
    description: "Find your match and start living.",
    step: "04",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Four simple steps to your new home
          </p>
        </div>
        
        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="glass rounded-2xl p-6 text-center group hover:bg-white/5 transition-all duration-300 relative"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-primary/50 to-secondary/50" />
                )}
                
                {/* Step number */}
                <div className="text-4xl font-bold text-gradient mb-4">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:glow-primary transition-all">
                  <step.icon className="w-7 h-7" />
                </div>
                
                {/* Content */}
                <h3 className="font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;