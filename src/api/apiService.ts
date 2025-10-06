import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      console.error("API Error:", error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network Error:", error.request);
    } else {
      // Something else happened
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  // Dashboard API
  getDashboardStats: () => api.get("/dashboard/stats"),

  // Bundles API (Dashboard)
  getDashboardBundles: () => api.get("/dashboard/bundles"),
  createBundle: (data: {
    platform: string;
    version: string;
    download_url: string;
    checksum?: string;
    session_key?: string;
    channel: string;
    environment: string;
    required: boolean;
    active: boolean;
  }) => api.post("/dashboard/bundles", data),
  updateBundle: (
    id: string,
    data: {
      platform?: string;
      version?: string;
      download_url?: string;
      checksum?: string;
      session_key?: string;
      channel?: string;
      environment?: string;
      required?: boolean;
      active?: boolean;
    }
  ) => api.put(`/dashboard/bundles/${id}`, data),
  deleteBundle: (id: string) => api.delete(`/dashboard/bundles/${id}`),

  // Channels API (Dashboard)
  getDashboardChannels: () => api.get("/dashboard/channels"),
  updateChannel: (id: string, data: { name: string; public: boolean }) =>
    api.put(`/dashboard/channels/${id}`, data),
  deleteChannel: (id: string) => api.delete(`/dashboard/channels/${id}`),

  // Devices API (Dashboard)
  getDashboardDevices: () => api.get("/dashboard/devices"),
  updateDeviceChannel: (id: string, channel: string) =>
    api.put(`/dashboard/devices/${id}/channel`, { channel }),
  deleteDevice: (id: string) => api.delete(`/dashboard/devices/${id}`),

  // Stats API (Dashboard)
  getDashboardStatsData: () => api.get("/dashboard/stats-data"),

  // Original Bundles API
  getBundles: () => api.get("/updates"),
  getBundle: (id: string) => api.get(`/bundles/${id}`),
  uploadBundle: (data: FormData) =>
    api.post("/admin/upload", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Original Channels API
  getChannels: () => api.get("/channels"),
  getChannel: (id: string) => api.get(`/channels/${id}`),
  createChannel: (data: { id: string; name: string; public: boolean }) =>
    api.post("/channels", data),

  // Original Devices API
  getDevices: () => api.get("/devices"),
  getDevice: (id: string) => api.get(`/devices/${id}`),

  // Original Stats API
  getStats: () => api.get("/stats"),
  getStatsByDevice: (deviceId: string) => api.get(`/stats/device/${deviceId}`),
  getStatsByBundle: (bundleId: string) => api.get(`/stats/bundle/${bundleId}`),

  // Update checks and related endpoints
  checkForUpdate: (data: {
    platform: string;
    version: string;
    appId: string;
    channel?: string;
    deviceId?: string;
  }) => api.post("/update", data),
  getBuiltInVersion: (data: {
    platform: string;
    appId: string;
    version: string;
  }) => api.get("/builtin", { params: data }),
  notifyDownloaded: (data: {
    bundleId: string;
    deviceId: string;
    appId: string;
    platform: string;
    version: string;
  }) => api.post("/downloaded", data),
  notifyApplied: (data: {
    bundleId: string;
    deviceId: string;
    appId: string;
    platform: string;
    version: string;
  }) => api.post("/applied", data),
  notifyFailed: (data: {
    bundleId: string;
    deviceId: string;
    appId: string;
    platform: string;
    version: string;
    error?: string;
  }) => api.post("/failed", data),

  // Health check
  healthCheck: () => api.get("/health"),

  // Additional endpoints based on backend implementation
  getUpdateLogs: () => api.get("/update_logs"),
  getUpdateLog: (id: string) => api.get(`/update_logs/${id}`),
  getDeviceChannel: (deviceId: string, appId: string, platform: string) =>
    api.get("/channel", { params: { deviceId, appId, platform } }),
  getAllDeviceChannels: (appId: string, platform: string) =>
    api.get("/channels", { params: { appId, platform } }),
  getAvailableUpdates: (data: {
    platform: string;
    appId: string;
    channel?: string;
    environment?: string;
  }) => api.get("/updates", { params: data }),
};
