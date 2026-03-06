import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

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
      { emoji: "🚇", label: "Metro nearby" },
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
      { emoji: "🐕", label: "Pets OK" },
    ],
  },
  {
    title: "Modern Studio Share",
    location: "Paris 15e, Vaugirard",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
    price: "€720/mo",
    postedBy: "Emma",
    posterAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop",
    roommatesWanted: 2,
    roommatesFound: 2,
    availableDate: "Jan 2026",
    amenities: [
      { emoji: "🏋️", label: "Gym" },
      { emoji: "📶", label: "WiFi" },
      { emoji: "❄️", label: "AC" },
      { emoji: "🔒", label: "Secure" },
    ],
  },
  {
    title: "Budget-Friendly Room",
    location: "Paris 18e, Montmartre",
    image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&auto=format&fit=crop",
    price: "€450/mo",
    postedBy: "Thomas",
    posterAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop",
    roommatesWanted: 4,
    roommatesFound: 1,
    availableDate: "Feb 2026",
    amenities: [
      { emoji: "📶", label: "WiFi" },
      { emoji: "🍳", label: "Kitchen" },
      { emoji: "🚇", label: "Metro nearby" },
    ],
  },
];

const Listings = () => {
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);
  const visibleListings = isLoggedIn ? [] : exampleListings.slice(0, 2);

  return (
    <PageLayout>
      <Navbar />
      <main className="pt-32 sm:pt-40 pb-16 sm:pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-2 sm:mb-3">
              Housing Listings
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Find available apartments and rooms near 42 campus
            </p>
          </div>

          {/* Listing Cards */}
          {visibleListings.length > 0 ? (
            <div className="space-y-6">
              {visibleListings.map((listing, index) => (
                <ListingCard key={index} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-muted-foreground">
                No listings available right now.
              </p>
            </div>
          )}

          {!isLoggedIn && (
            <div className="glass rounded-2xl p-6 sm:p-8 text-center mt-6">
              <h2 className="text-xl font-bold mb-2">Log in to See More</h2>
              <p className="text-muted-foreground mb-5">
                Sign in to unlock all listings and contact apartment owners.
              </p>
              <Button asChild>
                <Link to="/login">Go to Login</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </PageLayout>
  );
};

export default Listings;
