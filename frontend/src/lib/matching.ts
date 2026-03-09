// Simple local matching mechanism using localStorage
import { resolveAvatar } from "@/lib/avatar";

export interface UserPreferences {
  smoking: boolean;
  quietHours: boolean;
  earlyBird: boolean;
  nightOwl: boolean;
  petsOk: boolean;
  cooking: boolean;
  gaming: boolean;
  social: boolean;
  studious: boolean;
  clean: boolean;
}

export interface UserProfile {
  id: string;
  username?: string;
  name: string;
  sex?: "male" | "female" | "other";
  age: number;
  location: string;
  bio: string;
  avatar: string;
  moveInDate: string;
  budget: string;
  preferences: UserPreferences;
}

const DEFAULT_PREFERENCES: UserPreferences = {
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

const normalizePreferences = (preferences: any): UserPreferences => ({
  smoking: Boolean(preferences?.smoking),
  quietHours: Boolean(preferences?.quietHours),
  earlyBird: Boolean(preferences?.earlyBird),
  nightOwl: Boolean(preferences?.nightOwl),
  petsOk: Boolean(preferences?.petsOk),
  cooking: Boolean(preferences?.cooking),
  gaming: Boolean(preferences?.gaming),
  social: Boolean(preferences?.social),
  studious: Boolean(preferences?.studious),
  clean: Boolean(preferences?.clean),
});

const normalizeProfile = (profile: any): UserProfile | null => {
  if (!profile) return null;
  return {
    id: String(profile.id ?? ""),
    username: profile.username,
    name: profile.name || "",
    sex: profile.sex,
    age: Number(profile.age) || 0,
    location: profile.location || "",
    bio: profile.bio || "",
    avatar: resolveAvatar(profile.avatar),
    moveInDate: profile.moveInDate || "",
    budget: profile.budget || "",
    preferences: normalizePreferences(profile.preferences || DEFAULT_PREFERENCES),
  };
};

const isRenderableProfile = (profile: UserProfile): boolean => {
  if (!profile.id || profile.id.startsWith(DEMO_PROFILE_ID_PREFIX)) return false;
  if (!profile.name?.trim()) return false;
  if (!profile.location?.trim()) return false;
  if (!profile.bio?.trim()) return false;
  if (!Number.isFinite(profile.age) || profile.age < 18 || profile.age > 100) return false;
  return true;
};

const STORAGE_KEY = "42roommates_profiles";
const CURRENT_USER_KEY = "42roommates_current_user";
const DEMO_PROFILE_ID_PREFIX = "sample";

// Get all stored profiles
export const getProfiles = (): UserProfile[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeProfile)
      .filter(
        (profile): profile is UserProfile =>
          profile !== null &&
          isRenderableProfile(profile)
      );
  } catch {
    return [];
  }
};

// Save a profile
export const saveProfile = (profile: UserProfile): void => {
  const profiles = getProfiles();
  const existingIndex = profiles.findIndex(p => p.id === profile.id);
  
  if (existingIndex >= 0) {
    profiles[existingIndex] = profile;
  } else {
    profiles.push(profile);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
};

// Get current user profile
export const getCurrentUser = (): UserProfile | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (!stored) return null;
  try {
    return normalizeProfile(JSON.parse(stored));
  } catch {
    return null;
  }
};

// Set current user profile
export const setCurrentUser = (profile: UserProfile): void => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  saveProfile(profile);
};

// Remove profiles that represent the current user (stale duplicates from old sessions)
export const purgeSelfFromStoredProfiles = (currentUser: UserProfile): void => {
  const selfId = String(currentUser.id ?? "").trim();
  const selfUsername = String(currentUser.username ?? "").trim().toLowerCase();
  const selfName = String(currentUser.name ?? "").trim().toLowerCase();
  const selfLocation = String(currentUser.location ?? "").trim().toLowerCase();
  const selfBio = String(currentUser.bio ?? "").trim().toLowerCase();
  const selfAvatar = String(currentUser.avatar ?? "").trim();

  const sanitized = getProfiles().filter((profile) => {
    const id = String(profile.id ?? "").trim();
    const username = String(profile.username ?? "").trim().toLowerCase();
    const name = String(profile.name ?? "").trim().toLowerCase();
    const location = String(profile.location ?? "").trim().toLowerCase();
    const bio = String(profile.bio ?? "").trim().toLowerCase();
    const avatar = String(profile.avatar ?? "").trim();

    const sameById = Boolean(selfId) && id === selfId;
    const sameByUsername = Boolean(selfUsername) && username === selfUsername;
    const sameByCore = Boolean(selfName) && Boolean(selfLocation) && name === selfName && location === selfLocation;
    const sameByContent = Boolean(selfName) && Boolean(selfBio) && name === selfName && bio === selfBio;
    const sameByAvatar = Boolean(selfAvatar) && Boolean(selfName) && avatar === selfAvatar && name === selfName;

    return !(sameById || sameByUsername || sameByCore || sameByContent || sameByAvatar);
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
};

// Calculate match score between two users (0-100)
export const calculateMatchScore = (user1: UserPreferences, user2: UserPreferences): number => {
  const safeUser1 = normalizePreferences(user1 || DEFAULT_PREFERENCES);
  const safeUser2 = normalizePreferences(user2 || DEFAULT_PREFERENCES);
  const keys = Object.keys(safeUser1) as (keyof UserPreferences)[];
  let matches = 0;
  
  for (const key of keys) {
    if (safeUser1[key] === safeUser2[key]) {
      matches++;
    }
  }
  
  return Math.round((matches / keys.length) * 100);
};

// Get matched profiles sorted by compatibility
export const getMatchedProfiles = (currentUser: UserProfile): Array<UserProfile & { matchScore: number }> => {
  const currentUserId = String(currentUser.id ?? "").trim();
  const profiles = getProfiles().filter((p) => {
    const profileId = String(p.id ?? "").trim();
    return profileId.length > 0 && profileId !== currentUserId;
  });
  
  return profiles
    .map(profile => ({
      ...profile,
      matchScore: calculateMatchScore(currentUser.preferences, profile.preferences),
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
};

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
