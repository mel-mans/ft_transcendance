import { MapPin, Users, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListingData {
  id?: number;
  title: string;
  location: string;
  image: string;
  price: string;
  posterId?: number;
  postedBy: string;
  posterAvatar: string;
  roommatesWanted: number;
  roommatesFound: number;
  availableDate: string;
  amenities: { emoji: string; label: string }[];
}

interface ListingCardProps {
  listing: ListingData;
  transparentBackground?: boolean;
  insetImage?: boolean;
  onChatClick?: (listing: ListingData) => void;
  showChatButton?: boolean;
  chatDisabled?: boolean;
}

const ListingCard = ({
  listing,
  transparentBackground = false,
  insetImage = false,
  onChatClick,
  showChatButton = false,
  chatDisabled = false,
}: ListingCardProps) => {
  const spotsLeft = listing.roommatesWanted - listing.roommatesFound;
  const isFull = spotsLeft === 0;

  return (
    <div
      className={`rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300 ${
        transparentBackground ? "bg-black" : "glass"
      }`}
    >
      {/* Image */}
      <div
        className={`relative aspect-[10/4] overflow-hidden ${
          insetImage ? "p-2 bg-black" : ""
        }`}
      >
        <img
          src={listing.image}
          alt={listing.title}
          className={`w-full h-full object-cover ${insetImage ? "rounded-xl" : ""}`}
        />
        {/* Roommate counter badge */}
        <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full flex items-center gap-2 ${
          isFull 
            ? 'bg-destructive/90 text-destructive-foreground' 
            : 'bg-primary/90 text-primary-foreground'
        }`}>
          <Users className="w-4 h-4" />
          <span className="font-bold text-sm">
            {listing.roommatesFound}/{listing.roommatesWanted}
          </span>
        </div>
        {/* Price badge */}
        <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="font-bold text-primary">{listing.price}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title & Location */}
        <h3 className="text-base font-bold text-foreground mb-1">{listing.title}</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2.5">
          <MapPin className="w-3 h-3" />
          <span>{listing.location}</span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {listing.amenities.map((amenity, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs"
            >
              <span>{amenity.emoji}</span>
              <span className="text-muted-foreground">{amenity.label}</span>
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          {/* Posted by */}
          <div className="flex items-center gap-2">
            <img 
              src={listing.posterAvatar} 
              alt={listing.postedBy}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-xs text-muted-foreground">{listing.postedBy}</span>
          </div>
          {/* Available date */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{listing.availableDate}</span>
          </div>
        </div>

        {/* Status message */}
        <div className={`mt-3 text-center py-1.5 rounded-lg text-xs font-medium ${
          isFull 
            ? 'bg-destructive/10 text-destructive border border-destructive/20' 
            : 'bg-primary/10 text-primary border border-primary/20'
        }`}>
          {isFull 
            ? '⊘ No spots available' 
            : `✦ ${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} remaining`
          }
        </div>

        {showChatButton && (
          <Button
            type="button"
            onClick={() => onChatClick?.(listing)}
            disabled={chatDisabled}
            className="mt-3 w-full gap-2"
            variant="outline"
          >
            <MessageCircle className="w-4 h-4" />
            {chatDisabled ? "Cannot chat" : `Chat with ${listing.postedBy}`}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
