import './globals.css';
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotesProvider } from "@/context/NotesContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useFonts, DancingScript_700Bold } from "@expo-google-fonts/dancing-script";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded] = useFonts({ DancingScript_700Bold });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    if (!user && !inAuth) router.replace("/(auth)/login");
    else if (user && inAuth) router.replace("/");
  }, [user, loading]);

  if (!fontsLoaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator color="#4F6BFF" size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false, animation: "none" }} />;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <NotesProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </NotesProvider>
    </ThemeProvider>
  );
}