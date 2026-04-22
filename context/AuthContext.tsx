import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { api } from "@/lib/api";
import { useNotes } from "@/context/NotesContext";

WebBrowser.maybeCompleteAuthSession();

type User = {
  id: number;
  email: string;
  name: string;
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { refreshNotes, clearNotes } = useNotes();

  const [, response, promptAsync] = Google.useAuthRequest({
    clientId:        "TON_CLIENT_ID_WEB.apps.googleusercontent.com",
    androidClientId: "TON_CLIENT_ID_ANDROID.apps.googleusercontent.com",
  });

  // Chargement initial
  useEffect(() => {
    const loadUser = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        const data = await api.get("/auth/me");
        if (data.user) {
          setUser(data.user);
          await refreshNotes(); // Charge les notes du bon user
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleToken(id_token);
    }
  }, [response]);

  const handleGoogleToken = async (idToken: string) => {
    const data = await api.post("/auth/google", { idToken });
    if (data.token) {
      await SecureStore.setItemAsync("token", data.token);
      setUser(data.user);
      await refreshNotes(); // Charge les notes du bon user
    }
  };

  const login = async (email: string, password: string) => {
    const data = await api.post("/auth/login", { email, password });
    if (data.token) {
      await SecureStore.setItemAsync("token", data.token);
      setUser(data.user);
      await refreshNotes(); // Charge les notes du bon user
    } else {
      throw new Error(data.message || "Erreur de connexion");
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const data = await api.post("/auth/register", { email, password, name });
    if (!data.token) {
      throw new Error(data.message || "Erreur d'inscription");
    }
    // Pas de connexion auto après inscription
  };

  const logout = async () => {
    clearNotes();                                  //  Vide les notes en mémoire
    await SecureStore.deleteItemAsync("token");    //  Supprime le token
    setUser(null);                                 //  Déconnecte l'user
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle: () => promptAsync() as any, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

