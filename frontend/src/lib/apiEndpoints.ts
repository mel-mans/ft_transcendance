const API_PREFIXES = {
  auth: '/api/auth',
  users: '/api/users',
  chat: '/api/chat',
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
    test: `${API_PREFIXES.users}/test`,
    me: `${API_PREFIXES.users}/me`,
    getById: (id: number | string) => `${API_PREFIXES.users}/${id}`,
    completeProfile: `${API_PREFIXES.users}/complete-profile`,
    updateProfile: `${API_PREFIXES.users}/profile`,
    changePassword: `${API_PREFIXES.users}/password`,
  },
  chat: {
    root: `${API_PREFIXES.chat}/`,
  },
};

export default API_ENDPOINTS;
