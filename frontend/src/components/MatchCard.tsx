import { MapPin, Calendar, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/lib/matching";

interface MatchCardProps {
  user: UserProfile & { matchScore: number };
  onChatClick?: (user: { id?: string | number; name: string; avatar: string }) => void;
  blackBackground?: boolean;
}

const getMatchColor = (score: number) => {
  if (score >= 80) return "text-primary";
  if (score >= 60) return "text-secondary";
  if (score >= 40) return "text-accent";
  return "text-muted-foreground";
};

const getMatchLabel = (score: number) => {
  if (score >= 80) return "Great Match!";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Okay Match";
  return "Low Match";
};

const preferenceEmojiMap: Record<string, { emoji: string; label: string }> = {
  smoking: { emoji: "🚬", label: "Smoker" },
  quietHours: { emoji: "🤫", label: "Quiet hours" },
  earlyBird: { emoji: "🌅", label: "Early bird" },
  nightOwl: { emoji: "🌙", label: "Night owl" },
  petsOk: { emoji: "🐱", label: "Pet friendly" },
  cooking: { emoji: "🍳", label: "Cooks" },
  gaming: { emoji: "🎮", label: "Gamer" },
  social: { emoji: "🍻", label: "Social" },
  studious: { emoji: "📚", label: "Studious" },
  clean: { emoji: "🧹", label: "Clean" },
};

const MatchCard = ({
  user,
  onChatClick,
  blackBackground = false,
}: MatchCardProps) => {
  // Get active preferences for display
  const activePreferences = Object.entries(user.preferences)
    .filter(([_, value]) => value)
    .map(([key]) => preferenceEmojiMap[key])
    .filter(Boolean);

  return (
    <div
      className={`rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden w-[624px] h-[252.5px] ${
        blackBackground ? "bg-black" : "glass"
      }`}
    >
      {/* Match Score Badge */}
      <div className="absolute top-4 right-4">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 ${getMatchColor(user.matchScore)}`}>
          <Heart className="w-4 h-4 fill-current" />
          <span className="font-bold">{user.matchScore}%</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-4 pr-20">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-16 h-16 rounded-xl object-cover"
        />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground">
            {user.name}, {user.age}
          </h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <MapPin className="w-3 h-3" />
            <span>{user.location}</span>
          </div>
          <span className={`text-xs ${getMatchColor(user.matchScore)}`}>
            {getMatchLabel(user.matchScore)}
          </span>
        </div>
      </div>

      {/* Bio */}
      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
        {user.bio}
      </p>

      {/* Preferences */}
      <div className="flex flex-wrap gap-2 mb-4">
        {activePreferences.map((pref, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm"
          >
            <span>{pref.emoji}</span>
            <span className="text-muted-foreground">{pref.label}</span>
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{user.moveInDate}</span>
          </div>
          <span className="text-primary font-semibold">{user.budget}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChatClick?.({ id: user.id, name: user.name, avatar: user.avatar })}
          className="gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </Button>
      </div>
    </div>
  );
};

export default MatchCard;
