export const DEFAULT_DB_AVATAR = "default-avatar.png";
export const DEFAULT_AVATAR_URL = "/default-avatar-cute.svg";

export const resolveAvatar = (avatar?: string | null): string => {
  const value = String(avatar || "").trim();
  if (!value || value === DEFAULT_DB_AVATAR) {
    return DEFAULT_AVATAR_URL;
  }
  return value;
};
