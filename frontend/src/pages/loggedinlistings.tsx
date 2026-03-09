import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import ChatPopup from "@/components/ChatPopup";
import PageLayout from "@/components/PageLayout";
import { useAuth } from "@/lib/auth";
import api, { type ListingDto } from "@/lib/api";
import { resolveAvatar } from "@/lib/avatar";
import { toast } from "@/components/ui/sonner";

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "EUR ",
  USD: "$",
  GBP: "GBP ",
  CHF: "CHF ",
  JPY: "JPY ",
  CAD: "CAD ",
  AUD: "AUD ",
  MAD: "MAD ",
};

const AMENITIES = [
  { key: "hasWifi", emoji: "📶", label: "WiFi" },
  { key: "hasKitchen", emoji: "🍳", label: "Kitchen" },
  { key: "hasLaundry", emoji: "🧺", label: "Laundry" },
  { key: "hasMetroNearby", emoji: "🚇", label: "Metro nearby" },
  { key: "hasGarden", emoji: "🌳", label: "Garden" },
  { key: "hasParking", emoji: "🅿️", label: "Parking" },
  { key: "petsOK", emoji: "🐕", label: "Pets OK" },
  { key: "hasGym", emoji: "🏋️", label: "Gym" },
  { key: "hasAC", emoji: "❄️", label: "AC" },
  { key: "isSecure", emoji: "🔒", label: "Secure" },
] as const;

const toImageSrc = (value: string) => {
  if (!value) return "/placeholder.svg";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${window.location.origin}${normalized}`;
};

const toCardListing = (listing: ListingDto) => ({
  id: listing.id,
  title: listing.title,
  location: listing.location,
  image: toImageSrc(listing.images?.[0] || ""),
  images: (listing.images || []).map(toImageSrc),
  price: `${CURRENCY_SYMBOLS[listing.currency] || `${listing.currency} `}${listing.price}/mo`,
  posterId: listing.user?.id,
  postedBy: listing.user?.name || listing.user?.username || "Unknown",
  posterAvatar: resolveAvatar(listing.user?.avatar),
  roommatesWanted: listing.spotsTotal,
  roommatesFound: listing.spotsFilled,
  availableDate: String(listing.availableDate || "").slice(0, 10),
  amenities: AMENITIES.filter((item) => Boolean(listing[item.key])).map(({ emoji, label }) => ({
    emoji,
    label,
  })),
});

const LoggedInListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<ReturnType<typeof toCardListing>[]>([]);
  const [topMatch, setTopMatch] = useState<ReturnType<typeof toCardListing> | null>(null);
  const [matchPercentage, setMatchPercentage] = useState<number | null>(null);
  const [algorithmLabel, setAlgorithmLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState<{ id?: string | number; name: string; avatar: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.fetchListingRecommendations();

        if (data?.recommendation) {
          setTopMatch(toCardListing(data.recommendation));
        }

        if (typeof data?.aiScore === "number") {
          setMatchPercentage(Math.round(data.aiScore * 100));
        }

        const labels: Record<string, string> = {
          content_fallback: "Profile Match",
          online_ml: "Personalized for You",
          collaborative: "Community Recommended",
        };

        if (data?.algorithm) {
          setAlgorithmLabel(labels[data.algorithm] || data.algorithm);
        }

        const sourceListings =
          data?.allListings && data.allListings.length > 0
            ? data.allListings
            : data?.recommendations && data.recommendations.length > 0
            ? data.recommendations
            : [];

        if (sourceListings.length > 0) {
          setListings(sourceListings.map(toCardListing));
          return;
        }

        const fallback = await api.fetchAllListings();
        setListings(fallback.map(toCardListing));
      } catch (err: any) {
        setError(err?.message || "Could not load listings.");
      }
    })();
  }, []);

  const handleChatFromListing = (listing: ReturnType<typeof toCardListing>) => {
    if (!listing.posterId) {
      toast.error("This listing owner cannot be contacted right now.");
      return;
    }

    if (Number(user?.id) === listing.posterId) {
      toast.error("You cannot chat with your own listing.");
      return;
    }

    setChatUser({
      id: listing.posterId,
      name: listing.postedBy,
      avatar: listing.posterAvatar,
    });
    setChatOpen(true);
  };

  return (
    <PageLayout>
      <Navbar />
      <main className="pt-32 sm:pt-40 pb-16 sm:pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-2 sm:mb-3">
              Housing Listings
            </h1>
          </div>

          {topMatch && (
            <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 p-3">
              <p className="text-sm font-medium text-primary">
                ⭐ Perfect Match{matchPercentage !== null ? ` · ${matchPercentage}%` : ""}
                {algorithmLabel ? ` · ${algorithmLabel}` : ""}
              </p>
            </div>
          )}

          {listings.length > 0 ? (
            <div className="space-y-6">
              {listings.map((listing, index) => (
                <ListingCard
                  key={listing.id ?? index}
                  listing={listing}
                  transparentBackground
                  insetImage
                  showChatButton
                  chatDisabled={!listing.posterId || Number(user?.id) === listing.posterId}
                  onChatClick={handleChatFromListing}
                />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-muted-foreground">
                {error || "No listings available right now."}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <ChatPopup
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        user={chatUser}
      />
    </PageLayout>
  );
};

export default LoggedInListings;
