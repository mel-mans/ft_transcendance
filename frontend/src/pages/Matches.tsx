import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileSetupForm from "@/components/ProfileSetupForm";
import MatchCard from "@/components/MatchCard";
import ChatPopup from "@/components/ChatPopup";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  UserProfile,
  getCurrentUser,
} from "@/lib/matching";
import { resolveAvatar } from "@/lib/avatar";
import { useAuth } from '@/lib/auth';
import api, { type AIUserProfile } from "@/lib/api";
import { Settings, Sparkles, Zap } from "lucide-react";

const extractNumericBudget = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toAIProfile = (u: any): AIUserProfile | null => {
  if (!u?.id) return null;

  const prefs = u.preferences || {};
  const budget = extractNumericBudget(prefs.budget ?? u.budget);
  if (budget <= 0) return null;

  return {
    user_id: Number(u.id),
    budget_max: budget,
    cleanliness: (prefs.clean ?? u.clean) ? 5 : 3,
    sleep_schedule: (prefs.nightOwl ?? u.nightOwl) ? "night_owl" : "early_bird",
    smoker: Boolean(prefs.smoker ?? prefs.smoking ?? u.smoker ?? u.smoking),
    has_pets: Boolean(prefs.petFriendly ?? prefs.petsOk ?? u.petFriendly ?? u.petsOk),
  };
};

const Matches = () => {
  const DEFAULT_MATCH_THRESHOLD = 66;
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [matches, setMatches] = useState<Array<UserProfile & { matchScore: number }>>([]);
  const [matchThreshold, setMatchThreshold] = useState(DEFAULT_MATCH_THRESHOLD);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState<{ id?: string | number; name: string; avatar: string } | null>(null);
  const { user: authUser } = useAuth();

  const selfId = String(currentUser?.id ?? authUser?.id ?? "").trim();
  const filteredMatches = matches.filter((match) => {
    const matchId = String(match.id ?? "").trim();
    const isNotSelf = !selfId || matchId !== selfId;
    return isNotSelf && match.matchScore >= matchThreshold;
  });

  const updateThreshold = (value: number) => {
    if (Number.isNaN(value)) return;
    setMatchThreshold(Math.max(0, Math.min(100, value)));
  };

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
      avatar: resolveAvatar(user.avatar),
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
    (async () => {
      const authNormalizedUser = normalizeUserProfile(authUser);
      const localUser = normalizeUserProfile(getCurrentUser());
      const user = authNormalizedUser || localUser;
      setCurrentUser(user);

      if (user) {
        try {
          const allUsers = await api.fetchAllUsers();

          const targetAI = toAIProfile(user);

          // Get AI-powered matches with ML recommendations
          const matchedProfiles: Array<UserProfile & { matchScore: number }> = [];
          
          for (const candidate of allUsers) {
            const normalized = normalizeUserProfile(candidate);
            if (!normalized) continue;
            
            const candidateAI = toAIProfile(candidate);
            let matchScore = 50; // Default fallback score
            
            if (targetAI && candidateAI) {
              try {
                const result = await api.getAIMatch({
                  target_user: targetAI,
                  candidates: [candidateAI],
                });
                
                if (result.best_match_id === candidateAI.user_id) {
                  matchScore = Math.round(result.confidence_score * 100);
                }
              } catch (err) {
                // Use default fallback score
                console.warn('AI match failed for user', candidateAI.user_id, err);
              }
            }
            
            matchedProfiles.push({
              ...normalized,
              matchScore,
            });
          }

          matchedProfiles.sort((a, b) => b.matchScore - a.matchScore);
          setMatches(matchedProfiles);
        } catch (err) {
          console.error('Failed to fetch AI matches:', err);
          setMatches([]);
        }
      }
    })();
  }, [authUser]);

  const handleProfileComplete = async (profile: UserProfile) => {
    setCurrentUser(profile);
    setShowSetup(false);
    
    try {
      const allUsers = await api.fetchAllUsers();

      const targetAI = toAIProfile(profile);

      const matchedProfiles: Array<UserProfile & { matchScore: number }> = [];
      
      for (const candidate of allUsers) {
        const normalized = normalizeUserProfile(candidate);
        if (!normalized) continue;
        
        const candidateAI = toAIProfile(candidate);
        let matchScore = 50; // Default fallback score
        
        if (targetAI && candidateAI) {
          try {
            const result = await api.getAIMatch({
              target_user: targetAI,
              candidates: [candidateAI],
            });
            
            if (result.best_match_id === candidateAI.user_id) {
              matchScore = Math.round(result.confidence_score * 100);
            }
          } catch (err) {
            console.warn('AI match failed for user', candidateAI.user_id, err);
          }
        }
        
        matchedProfiles.push({
          ...normalized,
          matchScore,
        });
      }

      matchedProfiles.sort((a, b) => b.matchScore - a.matchScore);
      setMatches(matchedProfiles);
    } catch (err) {
      console.error('Failed to fetch AI matches:', err);
      setMatches([]);
    }
  };

  const handleChatClick = (user: { id?: string | number; name: string; avatar: string }) => {
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
              {/* Filter Controls */}
              {(() => {
                const glowColor =
                  matchThreshold >= 70
                    ? "shadow-[0_0_20px_hsl(var(--primary)/0.35)] border-primary/30"
                    : matchThreshold >= 40
                    ? "shadow-[0_0_20px_hsl(var(--secondary)/0.35)] border-secondary/30"
                    : "shadow-[0_0_20px_hsl(var(--destructive)/0.35)] border-destructive/30";

                const accentText =
                  matchThreshold >= 70
                    ? "text-primary"
                    : matchThreshold >= 40
                    ? "text-secondary"
                    : "text-destructive";

                return (
                  <div className={`relative mb-8 rounded-lg transition-all duration-500 ${glowColor}`}>
                    <div className="relative flex items-center gap-3 rounded-lg border border-inherit bg-card/30 backdrop-blur-sm px-4 py-3">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Zap className={`w-3 h-3 ${accentText} animate-pulse transition-colors duration-500`} />
                        <span className={`font-mono text-xs tracking-widest transition-colors duration-500 ${accentText}`}>
                          {matchThreshold}
                        </span>
                      </div>

                      <div className="w-px h-4 bg-white/10" />

                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[matchThreshold]}
                        onValueChange={([v]) => updateThreshold(v)}
                        className="flex-1"
                      />

                      <div className="w-px h-4 bg-white/10" />

                      <button
                        onClick={() => setShowSetup(true)}
                        className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
                        aria-label="Edit profile"
                        type="button"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Match Cards */}
              <div className="space-y-4">
                {filteredMatches.length > 0 ? (
                  filteredMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      user={match}
                      blackBackground
                      onChatClick={handleChatClick}
                    />
                  ))
                ) : (
                  <div className="glass rounded-2xl p-8 text-center">
                    <p className="text-muted-foreground">
                      No matches above {matchThreshold}% found yet. Check back later!
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
