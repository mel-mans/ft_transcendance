import { Shield, Users, MapPin, MessageCircle } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "42 Verified",
    description: "All users are verified through their 42 Intra accounts.",
    accent: "primary",
  },
  {
    icon: Users,
    title: "Smart Matching",
    description: "Find roommates based on lifestyle and schedule.",
    accent: "secondary",
  },
  {
    icon: MapPin,
    title: "Location Based",
    description: "Find housing near your 1337 campus.",
    accent: "primary",
  },
  {
    icon: MessageCircle,
    title: "In-App Chat",
    description: "Message potential roommates directly.",
    accent: "secondary",
  },
];

const Features = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for <span className="text-gradient">42 Students</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Features designed specifically for coding students
          </p>
        </div>
        
        {/* Features grid */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass rounded-2xl p-6 hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  feature.accent === 'primary' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-secondary/10 text-secondary'
                } group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Decorative ticker */}
        <div className="mt-16 overflow-hidden py-4 glass rounded-full mx-auto max-w-2xl">
          <div className="marquee text-sm whitespace-nowrap font-medium tracking-wide opacity-70">
            <span className="text-primary">✦ Find your roommate</span>
            <span className="text-muted-foreground mx-6">—</span>
            <span className="text-secondary">Verified students only</span>
            <span className="text-muted-foreground mx-6">—</span>
            <span className="text-primary">✦ Safe & secure</span>
            <span className="text-muted-foreground mx-6">—</span>
            <span className="text-secondary">Join today</span>
            <span className="text-muted-foreground mx-6">—</span>
            <span className="text-primary">✦ Find your roommate</span>
            <span className="text-muted-foreground mx-6">—</span>
            <span className="text-secondary">Verified students only</span>
            <span className="text-muted-foreground mx-6">—</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;