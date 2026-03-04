import axios from "axios";

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vidtrack_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("vidtrack_token");
      localStorage.removeItem("vidtrack_user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// Videos
export const videosAPI = {
  add: (url, published_date) => api.post("/videos", { url, published_date }),
  getAll: () => api.get("/videos"),
  getStats: () => api.get("/videos/stats"),
  refresh: (videoId) => api.post(`/videos/${videoId}/refresh`),
  delete: (videoId) => api.delete(`/videos/${videoId}`),
};

// Admin
export const adminAPI = {
  getCreators: () => api.get("/admin/creators"),
  getCreatorVideos: (creatorId) => api.get(`/admin/creators/${creatorId}/videos`),
  getStats: () => api.get("/admin/stats"),
  setCPM: (creatorId, cpm) => api.put(`/admin/creators/${creatorId}/cpm`, { cpm }),
  setPaymentStatus: (videoId, payment_status) => api.put(`/admin/videos/${videoId}/payment`, { payment_status }),
};

export default api;
