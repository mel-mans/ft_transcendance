import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UserProfileCard from "@/components/UserProfileCard";
import ChatPopup from "@/components/ChatPopup";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const exampleUsers = [
  {
    name: "Alex",
    age: 24,
    location: "Paris 13e",
    bio: "42 student in my second year. Love coding late nights but always respect quiet hours. Looking for a chill roommate who's okay with occasional gaming sessions!",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop",
    moveInDate: "Feb 2026",
    budget: "€600-800/mo",
    preferences: [
      { emoji: "🚭", label: "Non-smoker" },
      { emoji: "🤫", label: "Quiet hours" },
      { emoji: "🎮", label: "Gamer" },
      { emoji: "🌙", label: "Night owl" },
      { emoji: "🧹", label: "Clean" },
      { emoji: "🐱", label: "Pet friendly" },
    ],
  },
  {
    name: "Sofia",
    age: 22,
    location: "Paris 14e",
    bio: "New to 42, excited to meet people! I'm an early bird who enjoys cooking and keeping shared spaces tidy. Open to sharing meals!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop",
    moveInDate: "Mar 2026",
    budget: "€500-700/mo",
    preferences: [
      { emoji: "🚭", label: "Non-smoker" },
      { emoji: "🌅", label: "Early bird" },
      { emoji: "🍳", label: "Cooks" },
      { emoji: "🧘", label: "Calm vibes" },
      { emoji: "📚", label: "Studious" },
    ],
  },
  {
    name: "Marcus",
    age: 26,
    location: "Paris 15e",
    bio: "Third year at 42. I work remote sometimes so need a quiet space during the day. Love weekend hangouts and board games!",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop",
    moveInDate: "Feb 2026",
    budget: "€700-900/mo",
    preferences: [
      { emoji: "🚬", label: "Smoker (outside)" },
      { emoji: "💼", label: "Remote work" },
      { emoji: "🎲", label: "Board games" },
      { emoji: "🍻", label: "Social" },
      { emoji: "🧹", label: "Clean" },
    ],
  },
];

const FindRoommates = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState<{ name: string; avatar: string } | null>(null);
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);
  const visibleUsers = isLoggedIn ? [] : exampleUsers.slice(0, 2);

  const handleChatClick = (user: { name: string; avatar: string }) => {
    setChatUser(user);
    setChatOpen(true);
  };

  return (
    <PageLayout>
      <Navbar />
      <main className="pt-32 sm:pt-40 pb-16 sm:pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-2 sm:mb-3">
              Find Roommates
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Connect with fellow 42 students looking for housing partners
            </p>
          </div>

          {/* User Cards */}
          {visibleUsers.length > 0 ? (
            <div className="space-y-4">
              {visibleUsers.map((user, index) => (
                <UserProfileCard
                  key={index}
                  user={user}
                  onChatClick={handleChatClick}
                />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-muted-foreground">
                No roommate profiles available right now.
              </p>
            </div>
          )}

          {!isLoggedIn && (
            <div className="glass rounded-2xl p-6 sm:p-8 text-center mt-6">
              <h2 className="text-xl font-bold mb-2">Log in to See More</h2>
              <p className="text-muted-foreground mb-5">
                Sign in to unlock the full roommate directory and start chatting.
              </p>
              <Button asChild>
                <Link to="/login">Go to Login</Link>
              </Button>
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

export default FindRoommates;
