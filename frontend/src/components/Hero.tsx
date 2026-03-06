import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Home, Users } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { useState, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";
import ListingCard from "@/components/ListingCard";
import UserProfileCard from "@/components/UserProfileCard";
import { useNavigate } from "react-router-dom";

const exampleListings = [
  {
    title: "Cozy Apartment near Campus",
    location: "Paris 13e, 5 min from 42",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
    price: "€650/mo",
    postedBy: "Marie",
    posterAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop",
    roommatesWanted: 3,
    roommatesFound: 2,
    availableDate: "Feb 2026",
    amenities: [
      { emoji: "📶", label: "WiFi" },
      { emoji: "🍳", label: "Kitchen" },
      { emoji: "🧺", label: "Laundry" },
    ],
  },
  {
    title: "Spacious Shared House",
    location: "Paris 14e, Alésia",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop",
    price: "€580/mo",
    postedBy: "Lucas",
    posterAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop",
    roommatesWanted: 5,
    roommatesFound: 4,
    availableDate: "Mar 2026",
    amenities: [
      { emoji: "🌳", label: "Garden" },
      { emoji: "📶", label: "WiFi" },
      { emoji: "🅿️", label: "Parking" },
    ],
  },
];

const exampleUsers = [
  {
    name: "Alex",
    age: 24,
    location: "Paris 13e",
    bio: "42 student in my second year. Love coding late nights but always respect quiet hours!",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop",
    moveInDate: "Feb 2026",
    budget: "€600-800/mo",
    preferences: [
      { emoji: "🚭", label: "Non-smoker" },
      { emoji: "🤫", label: "Quiet hours" },
      { emoji: "🎮", label: "Gamer" },
    ],
  },
  {
    name: "Sofia",
    age: 22,
    location: "Paris 14e",
    bio: "New to 42, excited to meet people! I'm an early bird who enjoys cooking.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop",
    moveInDate: "Mar 2026",
    budget: "€500-700/mo",
    preferences: [
      { emoji: "🚭", label: "Non-smoker" },
      { emoji: "🌅", label: "Early bird" },
      { emoji: "🍳", label: "Cooks" },
    ],
  },
];

const Hero = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"listings" | "roommates">("listings");
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Reset carousel when tab changes
  useEffect(() => {
    if (api) {
      api.scrollTo(0);
      setCount(api.scrollSnapList().length);
      setCurrent(0);
    }
  }, [activeTab, api]);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center pt-28 sm:pt-32 pb-16 sm:pb-20 relative overflow-hidden">
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left: Text Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">For 42 Network Students</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
              <span className="text-foreground">Find Your Perfect</span>
              <br />
              <span className="text-gradient">Roommates</span>
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 mb-8 sm:mb-10">
              Connect with fellow 42 students to find compatible roommates and affordable housing near your campus.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/signup")}
                className="group w-full sm:w-auto bg-primary hover:bg-black text-black hover:text-primary border-black hover:border-black font-semibold px-8 rounded-full glow-primary"
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

          {/* Right: Carousel Preview */}
          <div className="relative">
            {/* Floating glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-2xl opacity-50" />
            
            <div className="relative">
              {/* Tab Switcher */}
              <div className="flex justify-center mb-4">
                <div className="glass rounded-full p-1 flex gap-1">
                  <button
                    onClick={() => setActiveTab("listings")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeTab === "listings"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    Listings
                  </button>
                  <button
                    onClick={() => setActiveTab("roommates")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeTab === "roommates"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Roommates
                  </button>
                </div>
              </div>

              {/* Carousel */}
              <Carousel 
                className="w-full" 
                opts={{ loop: true }} 
                plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
                setApi={setApi}
              >
                <CarouselContent>
                  {activeTab === "listings"
                    ? exampleListings.map((listing, index) => (
                        <CarouselItem key={index}>
                          <div className="transform scale-95 hover:scale-100 transition-transform duration-300">
                            <ListingCard listing={listing} />
                          </div>
                        </CarouselItem>
                      ))
                    : exampleUsers.map((user, index) => (
                        <CarouselItem key={index}>
                          <div className="transform scale-95 hover:scale-100 transition-transform duration-300">
                            <UserProfileCard user={user} />
                          </div>
                        </CarouselItem>
                      ))}
                </CarouselContent>
              </Carousel>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === current
                        ? "w-6 h-2 bg-primary glow-primary"
                        : "w-2 h-2 bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-primary/30 blur-xl" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-secondary/30 blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
