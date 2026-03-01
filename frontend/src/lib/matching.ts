// Simple local matching mechanism using localStorage

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

const STORAGE_KEY = "42roommates_profiles";
const CURRENT_USER_KEY = "42roommates_current_user";

// Get all stored profiles
export const getProfiles = (): UserProfile[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
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
  return stored ? JSON.parse(stored) : null;
};

// Set current user profile
export const setCurrentUser = (profile: UserProfile): void => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  saveProfile(profile);
};

// Calculate match score between two users (0-100)
export const calculateMatchScore = (user1: UserPreferences, user2: UserPreferences): number => {
  const keys = Object.keys(user1) as (keyof UserPreferences)[];
  let matches = 0;
  
  for (const key of keys) {
    if (user1[key] === user2[key]) {
      matches++;
    }
  }
  
  return Math.round((matches / keys.length) * 100);
};

// Get matched profiles sorted by compatibility
export const getMatchedProfiles = (currentUser: UserProfile): Array<UserProfile & { matchScore: number }> => {
  const profiles = getProfiles().filter(p => p.id !== currentUser.id);
  
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
