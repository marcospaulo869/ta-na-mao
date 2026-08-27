import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ---------- Walls ----------
export const listWalls = (projectId) => api.get(`/walls${projectId ? `?project_id=${projectId}` : ""}`).then((r) => r.data);
export const getWall = (id) => api.get(`/walls/${id}`).then((r) => r.data);
export const createWall = (payload) => api.post("/walls", payload).then((r) => r.data);
export const updateWall = (id, payload) => api.put(`/walls/${id}`, payload).then((r) => r.data);
export const deleteWall = (id) => api.delete(`/walls/${id}`).then((r) => r.data);
export const exportWallUrl = (id) => `${API}/walls/${id}/export`;
export const wallPdfUrl = (id) => `${API}/walls/${id}/pdf`;

// Blob download: fetches a PDF using the axios session (cookies + headers)
// and triggers a native download without leaving the PWA. This fixes the
// "black screen" issue where <a href target=_blank> crashed on mobile PWAs.
async function _downloadBlob(path, filenameFallback) {
  const res = await api.get(path, { responseType: "blob" });
  const blob = new Blob([res.data], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  // Try to extract filename from Content-Disposition
  const cd = res.headers?.["content-disposition"] || "";
  const match = cd.match(/filename="?([^"]+)"?/i);
  a.download = match ? match[1] : filenameFallback;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export const downloadWallPdf = (id, name = "parede") =>
  _downloadBlob(`/walls/${id}/pdf`, `${name}.pdf`);
export const downloadProjectPdf = (id, name = "projeto") =>
  _downloadBlob(`/projects/${id}/pdf`, `${name}.pdf`);

// ---------- Projects ----------
export const listProjects = () => api.get("/projects").then((r) => r.data);
export const getProject = (id) => api.get(`/projects/${id}`).then((r) => r.data);
export const createProject = (payload) => api.post("/projects", payload).then((r) => r.data);
export const updateProject = (id, payload) => api.put(`/projects/${id}`, payload).then((r) => r.data);
export const deleteProject = (id) => api.delete(`/projects/${id}`).then((r) => r.data);
export const attachWall = (projectId, wallId) => api.post(`/projects/${projectId}/walls/${wallId}`).then((r) => r.data);
export const detachWall = (projectId, wallId) => api.delete(`/projects/${projectId}/walls/${wallId}`).then((r) => r.data);
export const projectPdfUrl = (id) => `${API}/projects/${id}/pdf`;

// ---------- Photos ----------
export const createPhoto = (payload) => api.post("/photos", payload).then((r) => r.data);
export const listPhotos = (tipo) =>
  api.get(`/photos${tipo ? `?tipo=${tipo}` : ""}`).then((r) => r.data);
export const deletePhoto = (id) => api.delete(`/photos/${id}`).then((r) => r.data);
