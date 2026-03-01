import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPreferences, UserProfile, generateId, setCurrentUser } from "@/lib/matching";
import CurrencySelect from "@/components/CurrencySelect";

interface PreferenceOption {
  key: keyof UserPreferences;
  emoji: string;
  label: string;
  description: string;
}

const preferenceOptions: PreferenceOption[] = [
  { key: "smoking", emoji: "🚬", label: "Smoker", description: "I smoke or don't mind smoking" },
  { key: "quietHours", emoji: "🤫", label: "Quiet Hours", description: "I prefer quiet evenings" },
  { key: "earlyBird", emoji: "🌅", label: "Early Bird", description: "I wake up early" },
  { key: "nightOwl", emoji: "🌙", label: "Night Owl", description: "I stay up late" },
  { key: "petsOk", emoji: "🐱", label: "Pet Friendly", description: "I'm okay with pets" },
  { key: "cooking", emoji: "🍳", label: "Cooks", description: "I enjoy cooking" },
  { key: "gaming", emoji: "🎮", label: "Gamer", description: "I play video games" },
  { key: "social", emoji: "🍻", label: "Social", description: "I like having guests over" },
  { key: "studious", emoji: "📚", label: "Studious", description: "I need quiet study time" },
  { key: "clean", emoji: "🧹", label: "Clean", description: "I keep things tidy" },
];

interface ProfileSetupFormProps {
  onComplete: (profile: UserProfile) => void;
  existingProfile?: UserProfile | null;
}

const ProfileSetupForm = ({ onComplete, existingProfile }: ProfileSetupFormProps) => {
  const [username, setUsername] = useState(existingProfile?.username || "");
  const [name, setName] = useState(existingProfile?.name || "");
  const [sex, setSex] = useState(existingProfile?.sex || "");
  const [age, setAge] = useState(existingProfile?.age?.toString() || "");
  const [location, setLocation] = useState(existingProfile?.location || "");
  const [bio, setBio] = useState(existingProfile?.bio || "");
  const [moveInDate, setMoveInDate] = useState(existingProfile?.moveInDate || "");
  const [budget, setBudget] = useState(existingProfile?.budget || "");
  const [currency, setCurrency] = useState("€");
  const [avatarPreview, setAvatarPreview] = useState(existingProfile?.avatar || "");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const [preferences, setPreferences] = useState<UserPreferences>(
    existingProfile?.preferences || {
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
    }
  );

  const handlePreferenceChange = (key: keyof UserPreferences, checked: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedSex = sex.trim().toLowerCase();
    const safeSex: "male" | "female" | "other" =
      normalizedSex === "male" || normalizedSex === "female" || normalizedSex === "other"
        ? normalizedSex
        : "other";
    
    const profile: UserProfile = {
      id: existingProfile?.id || generateId(),
      username: username.trim(),
      name,
      sex: safeSex,
      age: parseInt(age) || 0,
      location,
      bio,
      avatar: avatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      moveInDate,
      budget,
      preferences,
    };

    setCurrentUser(profile);
    onComplete(profile);
  };

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <CardTitle className="text-xl text-gradient">
          {existingProfile ? "Edit Your Profile" : "Create Your Profile"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/30 bg-white/5">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-muted-foreground">
                    📷
                  </div>
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-xs font-medium text-white">Change</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Click to upload a photo</p>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                required
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Your age"
                required
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sex">Sex</Label>
            <Input
              id="sex"
              list="sex-options"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              placeholder="Search or choose: male, female, other"
              required
              className="bg-white/5 border-white/10"
            />
            <datalist id="sex-options">
              <option value="male" />
              <option value="female" />
              <option value="other" />
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Preferred Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Paris 13e"
              required
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="moveInDate">Move-in Date</Label>
              <Input
                id="moveInDate"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                placeholder="e.g., Mar 2026"
                required
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <div className="flex gap-2">
                <CurrencySelect value={currency} onChange={setCurrency} />
                <Input
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 500-700/mo"
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">About You</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell potential roommates about yourself..."
              rows={3}
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <Label className="text-base">Your Lifestyle & Preferences</Label>
            <p className="text-sm text-muted-foreground">
              Select what applies to you. We'll match you with compatible roommates.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {preferenceOptions.map((option) => (
                <label
                  key={option.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    preferences[option.key]
                      ? "bg-primary/20 border-primary"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  <Checkbox
                    checked={preferences[option.key]}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange(option.key, checked as boolean)
                    }
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{option.emoji}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            {existingProfile ? "Save Changes" : "Create Profile & Find Matches"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileSetupForm;
