import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UserProfileCard from "@/components/UserProfileCard";
import ChatPopup from "@/components/ChatPopup";
import PageLayout from "@/components/PageLayout";
import api from "@/lib/api";
import { resolveAvatar } from "@/lib/avatar";
import { useAuth } from "@/lib/auth";

const PREF_LABELS: Record<string, { emoji: string; label: string }> = {
  smoker: { emoji: "🚬", label: "Smoker" },
  quietHours: { emoji: "🤫", label: "Quiet hours" },
  earlyBird: { emoji: "🌅", label: "Early bird" },
  nightOwl: { emoji: "🌙", label: "Night owl" },
  petFriendly: { emoji: "🐕", label: "Pet friendly" },
  cooks: { emoji: "🍳", label: "Cooks" },
  gamer: { emoji: "🎮", label: "Gamer" },
  social: { emoji: "🍻", label: "Social" },
  studious: { emoji: "📚", label: "Studious" },
  clean: { emoji: "🧹", label: "Clean" },
};

const toRoommateCard = (user: any) => {
  const prefs = user?.preferences || {};
  const activePreferences = Object.keys(PREF_LABELS)
    .filter((key) => Boolean(prefs[key]))
    .map((key) => PREF_LABELS[key]);

  return {
    id: user.id,
    name: user.name || user.username || `User ${user.id}`,
    age: user.age || 0,
    location: prefs.location || "Unknown",
    bio: user.bio || "No bio yet.",
    avatar: resolveAvatar(user.avatar),
    moveInDate: prefs.moveInDate ? String(prefs.moveInDate).slice(0, 10) : "N/A",
    budget:
      prefs.budget !== undefined && prefs.budget !== null
        ? `${prefs.currency || "EUR"} ${prefs.budget}/mo`
        : "N/A",
    preferences: activePreferences.length > 0 ? activePreferences : [{ emoji: "✨", label: "No preferences set" }],
  };
};

const LoggedInRoommates = () => {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<ReturnType<typeof toRoommateCard>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState<{ id?: string | number; name: string; avatar: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.fetchAllUsers();
        setUsers((data || []).map(toRoommateCard));
      } catch (err: any) {
        setError(err?.message || "Could not load roommates.");
      }
    })();
  }, []);

  const handleChatClick = (user: { id?: string | number; name: string; avatar: string }) => {
    setChatUser(user);
    setChatOpen(true);
  };

  return (
    <PageLayout>
      <Navbar />
      <main className="pt-32 sm:pt-40 pb-16 sm:pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-2 sm:mb-3">
              Find Roommates
            </h1>
          </div>

          {users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user, index) => (
                <UserProfileCard
                  key={user.id ?? index}
                  user={user}
                  blackBackground
                  onChatClick={handleChatClick}
                />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-muted-foreground">
                {error || "No roommate profiles available right now."}
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

export default LoggedInRoommates;
