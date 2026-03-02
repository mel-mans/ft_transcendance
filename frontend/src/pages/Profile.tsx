import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatchCard from "@/components/MatchCard";
import ChatPopup from "@/components/ChatPopup";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  UserProfile,
  UserPreferences,
  getCurrentUser,
  getMatchedProfiles,
  saveProfile,
  setCurrentUser as storeCurrentUser,
} from "@/lib/matching";
import api from '@/lib/api';
import {
  MapPin,
  Calendar,
  Settings,
  Sparkles,
  Heart,
  Users,
  TrendingUp,
  Home,
  Plus,
  Edit,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ProfileSetupForm from "@/components/ProfileSetupForm";
import CreateListingForm from "@/components/CreateListingForm";
import { useAuth } from "@/lib/auth";

// Same sample profiles used in Matches
const sampleProfiles: UserProfile[] = [
  {
    id: "sample1",
    username: "alex42",
    name: "Alex",
    sex: "male",
    age: 24,
    location: "Paris 13e",
    bio: "42 student in my second year. Love coding late nights but always respect quiet hours.",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop",
    moveInDate: "Feb 2026",
    budget: "€600-800/mo",
    preferences: { smoking: false, quietHours: true, earlyBird: false, nightOwl: true, petsOk: true, cooking: false, gaming: true, social: false, studious: false, clean: true },
  },
  {
    id: "sample2",
    username: "sofia42",
    name: "Sofia",
    sex: "female",
    age: 22,
    location: "Paris 14e",
    bio: "New to 42, excited to meet people! Early bird who enjoys cooking.",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop",
    moveInDate: "Mar 2026",
    budget: "€500-700/mo",
    preferences: { smoking: false, quietHours: true, earlyBird: true, nightOwl: false, petsOk: false, cooking: true, gaming: false, social: false, studious: true, clean: true },
  },
  {
    id: "sample3",
    username: "marcus42",
    name: "Marcus",
    sex: "male",
    age: 26,
    location: "Paris 15e",
    bio: "Third year at 42. Remote work sometimes, love weekend hangouts!",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop",
    moveInDate: "Feb 2026",
    budget: "€700-900/mo",
    preferences: { smoking: true, quietHours: true, earlyBird: false, nightOwl: false, petsOk: true, cooking: true, gaming: true, social: true, studious: false, clean: true },
  },
  {
    id: "sample4",
    username: "luna42",
    name: "Luna",
    sex: "female",
    age: 23,
    location: "Paris 12e",
    bio: "First year at 42, love music and yoga. Looking for peaceful living.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop",
    moveInDate: "Apr 2026",
    budget: "€550-750/mo",
    preferences: { smoking: false, quietHours: true, earlyBird: true, nightOwl: false, petsOk: true, cooking: true, gaming: false, social: false, studious: true, clean: true },
  },
  {
    id: "sample5",
    username: "theo42",
    name: "Theo",
    sex: "male",
    age: 25,
    location: "Paris 11e",
    bio: "Night coder, coffee addict, and I make a mean pasta!",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop",
    moveInDate: "Feb 2026",
    budget: "€600-850/mo",
    preferences: { smoking: false, quietHours: false, earlyBird: false, nightOwl: true, petsOk: true, cooking: true, gaming: true, social: true, studious: false, clean: false },
  },
];

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

const emptyPreferences: UserPreferences = {
  smoking: false,
  quietHours: false,
  earlyBird: false,
  nightOwl: false,
  petsOk: false,
  cooking: false,
  gaming: false,
  social: false,
  studious: false,
  clean: false,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  CHF: "CHF",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  MAD: "Dh",
};

const normalizeUserProfile = (user: any): UserProfile | null => {
  if (!user) return null;

  const preferences = user.preferences || {};
  const location = preferences.location || user.location || "";
  const moveInDate = preferences.moveInDate
    ? String(preferences.moveInDate).slice(0, 10)
    : user.moveInDate || "";
  const budgetValue = preferences.budget ?? user.budget;
  const currencyCode = preferences.currency || user.currency || "";
  const budget =
    budgetValue !== undefined && budgetValue !== null && String(budgetValue).trim() !== ""
      ? `${CURRENCY_SYMBOLS[currencyCode] || currencyCode}${budgetValue}`
      : "";

  return {
    id: String(user.id ?? ""),
    username: user.username || "",
    name: user.name || user.firstName || "",
    sex: user.sex,
    age: Number(user.age) || 0,
    location,
    bio: user.bio || "",
    avatar: user.avatar || "",
    moveInDate,
    budget,
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

const isProfileComplete = (user: UserProfile | null) => {
  if (!user) return false;
  return Boolean(
    user.name?.trim() &&
    user.age > 0 &&
    user.location?.trim() &&
    user.bio?.trim() &&
    user.moveInDate?.trim() &&
    user.budget?.trim() &&
    user.preferences
  );
};

const Profile = () => {
  const { user: authUser, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<Array<UserProfile & { matchScore: number }>>([]);
  const [showSetup, setShowSetup] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState<{ name: string; avatar: string } | null>(null);
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [logoutArmed, setLogoutArmed] = useState(false);
  const [myListings, setMyListings] = useState<Array<{ title: string; location: string; price: string; currency: string; availableDate: string; roommatesWanted: number; roommatesFound: number; amenities: string[]; images: string[]; description: string }>>([]);

  useEffect(() => {
    // Load local sample profiles
    sampleProfiles.forEach(saveProfile);

    (async () => {
      const localUser = normalizeUserProfile(getCurrentUser());

      // Try fetching authenticated user from backend
      try {
        const apiUser = await api.fetchCurrentUser();
        const normalizedApiUser = normalizeUserProfile(apiUser);
        if (normalizedApiUser) {
          const preferredUser =
            isProfileComplete(normalizedApiUser) || !localUser
              ? normalizedApiUser
              : localUser;

          setCurrentUser(preferredUser);
          storeCurrentUser(preferredUser);
          setShowSetup(!isProfileComplete(preferredUser));
          setMatches(
            isProfileComplete(preferredUser) ? getMatchedProfiles(preferredUser) : []
          );
          return;
        }
      } catch (err) {
        // fallback to local stored user
      }

      setCurrentUser(localUser);
      if (localUser) {
        setShowSetup(!isProfileComplete(localUser));
        setMatches(isProfileComplete(localUser) ? getMatchedProfiles(localUser) : []);
      }
    })();
  }, []);

  const handleProfileComplete = (profile: UserProfile) => {
    setCurrentUser(profile);
    updateUser({
      ...(authUser || {}),
      id: profile.id,
      username: profile.username,
      name: profile.name,
      age: profile.age,
      sex: profile.sex,
      bio: profile.bio,
      avatar: profile.avatar,
    });
    setShowSetup(false);
    const matched = getMatchedProfiles(profile);
    setMatches(matched);
  };

  const handleLogoutClick = () => {
    if (!logoutArmed) {
      setLogoutArmed(true);
      return;
    }

    localStorage.removeItem("42roommates_current_user");
    logout();
    navigate("/login");
  };

  const handleChatClick = (user: { name: string; avatar: string }) => {
    setChatUser(user);
    setChatOpen(true);
  };

  const activePreferences = currentUser
    ? Object.entries(currentUser.preferences)
        .filter(([_, value]) => value)
        .map(([key]) => preferenceEmojiMap[key])
        .filter(Boolean)
    : [];

  const topMatches = matches.slice(0, 3);
  const avgScore = topMatches.length > 0
    ? Math.round(topMatches.reduce((sum, m) => sum + m.matchScore, 0) / topMatches.length)
    : 0;

  const displaySex =
    currentUser?.sex && currentUser.sex !== "other"
      ? `${currentUser.sex.charAt(0).toUpperCase()}${currentUser.sex.slice(1)}`
      : "";

  // No profile state
  if (!currentUser && !showSetup) {
    return (
      <PageLayout>
        <Navbar />
        <main className="pt-32 sm:pt-40 pb-16 sm:pb-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="glass rounded-2xl p-8 sm:p-12 text-center">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
              <h1 className="text-2xl sm:text-3xl font-bold mb-3">Your Profile Space</h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Set up your profile to unlock personalized roommate recommendations and see your closest matches.
              </p>
              <Button onClick={() => setShowSetup(true)} size="lg" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Create Your Profile
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </PageLayout>
    );
  }

  // Profile setup form
  if (showSetup) {
    return (
      <PageLayout>
        <Navbar />
        <main className="pt-32 sm:pt-40 pb-16 sm:pb-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
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
        </main>
        <Footer />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Navbar />
      <main className="pt-32 sm:pt-40 pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">

          {/* Profile Header Card */}
          <div className="glass rounded-2xl p-6 sm:p-8 relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />

            <div className="relative flex flex-col sm:flex-row items-start gap-5">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-primary/30">
                <AvatarImage
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl rounded-2xl bg-primary/20 text-primary">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {currentUser.name}
                    </h1>
                    <div className="text-sm text-muted-foreground mt-1">
                      {currentUser.username ? `@${currentUser.username}` : "@username"}
                    </div>
                    <div className="mt-2">
                      <span className="text-sm font-semibold text-primary">
                        {displaySex ? `${displaySex} : ` : ""}{currentUser.age} years
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="text-sm">{currentUser.location}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSetup(true)}
                    className="gap-2 shrink-0"
                  >
                    <Settings className="w-4 h-4" />
                    Edit
                  </Button>
                </div>

                <p className="text-muted-foreground text-sm mt-3 leading-relaxed line-clamp-2">
                  {currentUser.bio}
                </p>

                {/* Quick info chips */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {currentUser.moveInDate}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {currentUser.budget}
                  </span>
                </div>
              </div>
            </div>

            {/* Preferences row */}
            <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/10">
              {activePreferences.map((pref, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm"
                >
                  <span>{pref.emoji}</span>
                  <span className="text-muted-foreground">{pref.label}</span>
                </span>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                onClick={handleLogoutClick}
                className={
                  logoutArmed
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : ""
                }
                variant={logoutArmed ? "destructive" : "outline"}
              >
                {logoutArmed ? "Confirm Logout" : "Logout"}
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Heart, label: "Avg. Match", value: `${avgScore}%`, color: "text-primary" },
              { icon: Users, label: "Candidates", value: `${matches.length}`, color: "text-secondary" },
              { icon: TrendingUp, label: "Top Match", value: topMatches[0] ? `${topMatches[0].matchScore}%` : "—", color: "text-primary" },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-xl p-4 text-center">
                <stat.icon className={`w-5 h-5 mx-auto mb-1.5 ${stat.color}`} />
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Create Listing Section */}
          {showCreateListing || editingIndex !== null ? (
            <CreateListingForm
              onClose={() => {
                setShowCreateListing(false);
                setEditingIndex(null);
              }}
              onPublish={(listing) => {
                if (editingIndex !== null) {
                  // Update existing listing
                  setMyListings((prev) =>
                    prev.map((item, idx) =>
                      idx === editingIndex ? listing : item
                    )
                  );
                  setEditingIndex(null);
                } else {
                  // Create new listing
                  setMyListings((prev) => [listing, ...prev]);
                  setShowCreateListing(false);
                }
              }}
              userName={currentUser.name}
              userAvatar={currentUser.avatar}
              existingListing={editingIndex !== null ? myListings[editingIndex] : undefined}
            />
          ) : (
            <div className="glass rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-bold text-foreground text-sm">Got a place to share?</h3>
                  <p className="text-xs text-muted-foreground">List your apartment for other students</p>
                </div>
              </div>
              <Button size="sm" onClick={() => setShowCreateListing(true)} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Create Listing
              </Button>
            </div>
          )}

          {/* My Listings Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold text-foreground">My Listings</h2>
              <span className="ml-auto text-xs text-muted-foreground">{myListings.length} listing{myListings.length !== 1 ? "s" : ""}</span>
            </div>

            {myListings.length > 0 ? (
              <div className="space-y-3">
                {myListings.map((listing, i) => (
                  <div key={i} className="glass rounded-xl overflow-hidden border border-white/10 hover:border-primary/30 transition-colors">
                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                      {/* First Image Thumbnail */}
                      {listing.images.length > 0 && (
                        <div className="sm:w-32 sm:h-32 w-full h-40 sm:h-auto shrink-0">
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-foreground text-sm sm:text-base truncate">{listing.title}</h3>
                          
                          {/* Quick Info */}
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {listing.location}
                            </span>
                            <span className="font-semibold text-primary">
                              {listing.currency}{listing.price}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {listing.availableDate}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {listing.roommatesFound}/{listing.roommatesWanted}
                            </span>
                          </div>

                          {/* Description */}
                          {listing.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">
                              {listing.description}
                            </p>
                          )}

                          {/* Amenities */}
                          {listing.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {listing.amenities.slice(0, 3).map((a) => (
                                <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                                  {a}
                                </span>
                              ))}
                              {listing.amenities.length > 3 && (
                                <span className="text-xs px-2 py-0.5 text-muted-foreground">
                                  +{listing.amenities.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setEditingIndex(i)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setMyListings((prev) => prev.filter((_, idx) => idx !== i))}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass rounded-xl p-6 text-center border border-white/10">
                <p className="text-sm text-muted-foreground">No listings yet. Create one above!</p>
              </div>
            )}
          </div>

          {/* Top Matches Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Closest Matches</h2>
              </div>
              <Link to="/matches">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  View All
                  <TrendingUp className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {topMatches.length > 0 ? (
                topMatches.map((match) => (
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
          </div>
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

export default Profile;
