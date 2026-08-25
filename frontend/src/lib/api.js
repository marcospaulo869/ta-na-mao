import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

// ---------- Walls ----------
export const listWalls = () => api.get("/walls").then((r) => r.data);
export const getWall = (id) => api.get(`/walls/${id}`).then((r) => r.data);
export const createWall = (payload) => api.post("/walls", payload).then((r) => r.data);
export const updateWall = (id, payload) => api.put(`/walls/${id}`, payload).then((r) => r.data);
export const deleteWall = (id) => api.delete(`/walls/${id}`).then((r) => r.data);
export const exportWallUrl = (id) => `${API}/walls/${id}/export`;

// ---------- Photos ----------
export const createPhoto = (payload) => api.post("/photos", payload).then((r) => r.data);
export const listPhotos = (tipo) =>
  api.get(`/photos${tipo ? `?tipo=${tipo}` : ""}`).then((r) => r.data);
export const deletePhoto = (id) => api.delete(`/photos/${id}`).then((r) => r.data);
