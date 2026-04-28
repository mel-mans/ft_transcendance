const API_PREFIXES = {
  auth: '/api/auth',
  users: '/api/users',
  chat: '/api/chat',
  listings: '/api/listings',
  ai: '/api/ai',
};

export const API_ENDPOINTS = {
  auth: {
    root: `${API_PREFIXES.auth}/`,
    signup: `${API_PREFIXES.auth}/signup`,
    login: `${API_PREFIXES.auth}/login`,
    logout: `${API_PREFIXES.auth}/logout`,
    profile: `${API_PREFIXES.auth}/profile`,
    google: `${API_PREFIXES.auth}/google`,
    intra42: `${API_PREFIXES.auth}/42`,
  },
  users: {
    root: `${API_PREFIXES.users}/`,
    all: `${API_PREFIXES.users}/all`,
    test: `${API_PREFIXES.users}/test`,
    me: `${API_PREFIXES.users}/me`,
    getById: (id: number | string) => `${API_PREFIXES.users}/${id}`,
    completeProfile: `${API_PREFIXES.users}/complete-profile`,
    updateProfile: `${API_PREFIXES.users}/profile`,
    changePassword: `${API_PREFIXES.users}/password`,
    avatar: `${API_PREFIXES.users}/avatar`,
  },
  chat: {
    root: `${API_PREFIXES.chat}/`,
    messages: {
      inbox: `${API_PREFIXES.chat}/messages/inbox`,
      withUser: (userId: number | string) => `${API_PREFIXES.chat}/messages/${userId}`,
      markRead: (userId: number | string) => `${API_PREFIXES.chat}/messages/${userId}/read`,
    },
    socketNamespace: "/chat",
  },
  listings: {
    root: `${API_PREFIXES.listings}/`,
    all: `${API_PREFIXES.listings}/all`,
    recommendations: `${API_PREFIXES.listings}/recommendations`,
    myListings: `${API_PREFIXES.listings}/my-listings`,
    byId: (id: number | string) => `${API_PREFIXES.listings}/${id}`,
    photos: (id: number | string) => `${API_PREFIXES.listings}/${id}/photos`,
    photoByIndex: (id: number | string, photoIndex: number) =>
      `${API_PREFIXES.listings}/${id}/photos/${photoIndex}`,
  },
  ai: {
    root: `${API_PREFIXES.ai}/`,
    match: `${API_PREFIXES.ai}/match`,
    feedback: `${API_PREFIXES.ai}/feedback`,
    modelStatus: `${API_PREFIXES.ai}/model/status`,
    generateBio: `${API_PREFIXES.ai}/generate-bio`,
  },
};

export default API_ENDPOINTS;
