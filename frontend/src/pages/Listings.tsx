import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const exampleListings = [
  {
    id: 1,
    title: "Cozy Apartment near Campus",
    location: "Paris 13e, 5 min from 42",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=800&auto=format&fit=crop",
    ],
    price: "€650/mo",
    posterId: 101,
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
    id: 2,
    title: "Spacious Shared House",
    location: "Paris 14e, Alésia",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&auto=format&fit=crop",
    ],
    price: "€580/mo",
    posterId: 102,
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
  {
    id: 3,
    title: "Modern Studio with Rooftop",
    location: "Paris 12e, Nation",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486304873000-235643847519?w=800&auto=format&fit=crop",
    ],
    price: "€720/mo",
    posterId: 103,
    postedBy: "Nora",
    posterAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop",
    roommatesWanted: 2,
    roommatesFound: 1,
    availableDate: "Apr 2026",
    amenities: [
      { emoji: "🚇", label: "Metro nearby" },
      { emoji: "🐕", label: "Pets OK" },
      { emoji: "🔒", label: "Secure" },
    ],
  },
];

const Listings = () => {
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);
  const listings = exampleListings;

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
          {listings.length > 0 ? (
            <div className="space-y-6">
              {listings.map((listing, index) => (
                <ListingCard
                  key={listing.id ?? index}
                  listing={listing}
                  transparentBackground
                  insetImage
                  showChatButton
                  chatDisabled
                />
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
            <div className="text-center mt-6">
              <Button
                asChild
                className="bg-primary hover:bg-black text-black hover:text-primary border-black hover:border-black font-semibold px-8 rounded-none"
              >
                <Link to="/login">Log in to create a listing</Link>
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
