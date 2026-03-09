import { MapPin, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Preference {
  emoji: string;
  label: string;
}

interface UserProfile {
  id?: string | number;
  name: string;
  age: number;
  location: string;
  bio: string;
  avatar: string;
  moveInDate: string;
  budget: string;
  preferences: Preference[];
}

interface UserProfileCardProps {
  user: UserProfile;
  onChatClick?: (user: { id?: string | number; name: string; avatar: string }) => void;
  blackBackground?: boolean;
  chatDisabled?: boolean;
  fixedSize?: boolean;
}

const UserProfileCard = ({
  user,
  onChatClick,
  blackBackground = false,
  chatDisabled = false,
  fixedSize = true,
}: UserProfileCardProps) => {
  return (
    <div
      className={`rounded-2xl p-4 hover:scale-[1.02] transition-all duration-300 overflow-hidden ${
        fixedSize ? "w-[624px] h-[252.5px]" : ""
      } ${
        blackBackground ? "bg-black" : "glass"
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <img 
          src={user.avatar} 
          alt={user.name}
          className="w-12 h-12 rounded-xl object-cover"
        />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">{user.name}, {user.age}</h3>
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <MapPin className="w-3 h-3" />
            <span>{user.location}</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          disabled={chatDisabled}
          onClick={() => onChatClick?.({ id: user.id, name: user.name, avatar: user.avatar })}
          className="shrink-0"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
      </div>

      {/* Bio */}
      <p className="text-muted-foreground text-sm mb-3 leading-relaxed max-h-12 overflow-hidden">
        {user.bio}
      </p>

      {/* Preferences */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {user.preferences.map((pref, index) => (
          <span 
            key={index}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs"
          >
            <span>{pref.emoji}</span>
            <span className="text-muted-foreground">{pref.label}</span>
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{user.moveInDate}</span>
        </div>
        <span className="text-primary text-sm font-semibold">{user.budget}</span>
      </div>
    </div>
  );
};

export default UserProfileCard;
