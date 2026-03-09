import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useGlitch } from "react-powerglitch";
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

const mixedCarouselItems = [
  { type: "listing", data: exampleListings[0] },
  { type: "roommate", data: exampleUsers[0] },
  { type: "listing", data: exampleListings[1] },
  { type: "roommate", data: exampleUsers[1] },
] as const;

const Hero = () => {
  const navigate = useNavigate();
  const getStartedGlitch = useGlitch({
    playMode: "hover",
  });

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

          {/* Right: Carousel Preview */}
          <div className="relative">
            {/* Floating glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl blur-2xl opacity-30" />
            
            <div className="relative">
              {/* Carousel */}
              <Carousel
                className="w-full"
                opts={{ loop: true, align: "center" }}
                variant="cone-vertical"
              >
                <CarouselContent>
                  {mixedCarouselItems.map((item, index) => (
                    <CarouselItem key={index}>
                      <div className="w-[250px] h-[250px] mx-auto overflow-hidden rounded-2xl transform transition-transform duration-300 hover:scale-[1.02]">
                        {item.type === "listing" ? (
                          <ListingCard listing={item.data} transparentBackground insetImage fixedSize={false} />
                        ) : (
                          <UserProfileCard user={item.data} blackBackground fixedSize={false} />
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full bg-primary/15 blur-xl" />
              <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-secondary/15 blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
