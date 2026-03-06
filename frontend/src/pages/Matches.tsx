import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileSetupForm from "@/components/ProfileSetupForm";
import MatchCard from "@/components/MatchCard";
import ChatPopup from "@/components/ChatPopup";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import {
  UserProfile,
  getCurrentUser,
  getMatchedProfiles,
} from "@/lib/matching";
import { useAuth } from '@/lib/auth';
import { Settings, Sparkles } from "lucide-react";

const Matches = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [matches, setMatches] = useState<Array<UserProfile & { matchScore: number }>>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState<{ name: string; avatar: string } | null>(null);
  const { user: authUser } = useAuth();

  const normalizeUserProfile = (user: any): UserProfile | null => {
    if (!user) return null;

    const preferences = user.preferences || {};

    return {
      id: String(user.id ?? ""),
      username: user.username || "",
      name: user.name || "",
      sex: user.sex,
      age: Number(user.age) || 0,
      location: preferences.location || user.location || "",
      bio: user.bio || "",
      avatar: user.avatar || "",
      moveInDate: preferences.moveInDate
        ? String(preferences.moveInDate).slice(0, 10)
        : user.moveInDate || "",
      budget:
        preferences.budget !== undefined && preferences.budget !== null
          ? String(preferences.budget)
          : user.budget || "",
      preferences: {
        smoking: Boolean(preferences.smoker ?? user.smoker ?? false),
        quietHours: Boolean(preferences.quietHours ?? user.quietHours ?? false),
        earlyBird: Boolean(preferences.earlyBird ?? user.earlyBird ?? false),
        nightOwl: Boolean(preferences.nightOwl ?? user.nightOwl ?? false),
        petsOk: Boolean(preferences.petFriendly ?? user.petFriendly ?? false),
        cooking: Boolean(preferences.cooks ?? user.cooks ?? false),
        gaming: Boolean(preferences.gamer ?? user.gamer ?? false),
        social: Boolean(preferences.social ?? user.social ?? false),
        studious: Boolean(preferences.studious ?? user.studious ?? false),
        clean: Boolean(preferences.clean ?? user.clean ?? false),
      },
    };
  };

  useEffect(() => {
    const authNormalizedUser = normalizeUserProfile(authUser);
    const localUser = normalizeUserProfile(getCurrentUser());
    const user = authNormalizedUser || localUser;
    setCurrentUser(user);

    if (user) {
      const matched = getMatchedProfiles(user);
      setMatches(matched);
    }
  }, [authUser]);

  const handleProfileComplete = (profile: UserProfile) => {
    setCurrentUser(profile);
    setShowSetup(false);
    const matched = getMatchedProfiles(profile);
    setMatches(matched);
  };

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
            <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gradient">
                Your Matches
              </h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              {currentUser
                ? "Roommates ranked by compatibility with your preferences"
                : "Create your profile to find compatible roommates"}
            </p>
          </div>

          {/* No Profile State */}
          {!currentUser && !showSetup && (
            <div className="glass rounded-2xl p-8 text-center">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Find Your Perfect Match</h2>
              <p className="text-muted-foreground mb-6">
                Tell us about yourself and we'll recommend roommates that match your lifestyle.
              </p>
              <Button onClick={() => setShowSetup(true)} size="lg" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Create Your Profile
              </Button>
            </div>
          )}

          {/* Profile Setup Form */}
          {showSetup && (
            <div className="mb-8">
              <ProfileSetupForm
                onComplete={handleProfileComplete}
                existingProfile={currentUser}
              />
              {currentUser && (
                <Button
                  variant="ghost"
                  onClick={() => setShowSetup(false)}
                  className="mt-4 w-full"
                >
                  Cancel
                </Button>
              )}
            </div>
          )}

          {/* User has profile - show matches */}
          {currentUser && !showSetup && (
            <>
              {/* Edit Profile Button */}
              <div className="flex justify-end mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSetup(true)}
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>

              {/* Match Cards */}
              <div className="space-y-4">
                {matches.length > 0 ? (
                  matches.map((match) => (
                    <MatchCard
                      key={match.id}
                      user={match}
                      onChatClick={handleChatClick}
                    />
                  ))
                ) : (
                  <div className="glass rounded-2xl p-8 text-center">
                    <p className="text-muted-foreground">
                      No matches found yet. Check back later!
                    </p>
                  </div>
                )}
              </div>
            </>
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

export default Matches;
