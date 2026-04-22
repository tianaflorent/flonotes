import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

// Détecte automatiquement l'IP du PC qui lance le serveur Expo
const getBaseUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri
    || Constants.manifest2?.extra?.expoGo?.debuggerHost
    || Constants.manifest?.debuggerHost;

  if (debuggerHost) {
    // Extrait l'IP depuis le host Expo 
    const ip = debuggerHost.split(":")[0];
    return `http://${ip}:3000`;
  }

  // Fallback si pas trouvé
  return "http://localhost:3000";
};

const BASE_URL = getBaseUrl();
console.log("🌐 API URL:", BASE_URL); // Pour vérifier dans les logs Expo

const getToken = () => SecureStore.getItemAsync("token");

export const api = {
  post: async (path: string, body: object, auth = false) => {
    const headers: any = { "Content-Type": "application/json" };
    if (auth) headers["Authorization"] = `Bearer ${await getToken()}`;
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST", headers,
      body: JSON.stringify(body),
    });
    return res.json();
  },

  get: async (path: string) => {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  put: async (path: string, body: object) => {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    return res.json();
  },

  delete: async (path: string) => {
    const token = await getToken();
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};