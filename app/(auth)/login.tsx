import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StatusBar,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Animated, ScrollView, Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useThemeMode } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboard?: any;
  secure?: boolean;
  icon: any;
  focusedField: string | null;
  setFocusedField: (v: string | null) => void;
  showPassword?: boolean;
  setShowPassword?: (fn: (p: boolean) => boolean) => void;
  isDark: boolean;
  borderFoc: string;
  textPri: string;
  textSec: string;
  inputBg: string;
  border: string;
};

function Field({
  id, label, value, onChange, placeholder, keyboard, secure, icon,
  focusedField, setFocusedField, showPassword, setShowPassword,
  isDark, borderFoc, textPri, textSec, inputBg, border,
}: FieldProps) {
  const focused = focusedField === id;
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{
        fontSize: 13, fontWeight: "600",
        color: focused ? borderFoc : textPri,
        marginBottom: 8,
      }}>
        {label}
      </Text>
      <View style={{
        flexDirection: "row", alignItems: "center",
        backgroundColor: inputBg,
        borderWidth: 1.5,
        borderColor: focused ? borderFoc : border,
        borderRadius: 12,
        paddingHorizontal: 14,
      }}>
        <Ionicons
          name={icon}
          size={18}
          color={focused ? borderFoc : textSec}
          style={{ marginRight: 10 }}
        />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          keyboardType={keyboard ?? "default"}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={secure && !showPassword}
          placeholderTextColor={isDark ? "#3A4266" : "#B8C0DC"}
          onFocus={() => setFocusedField(id)}
          onBlur={() => setFocusedField(null)}
          style={{
            flex: 1,
            paddingVertical: 14,
            fontSize: 15,
            color: textPri,
          }}
        />
        {secure && setShowPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(p => !p)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={textSec}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function Login() {
  const { login } = useAuth();
  const { darkMode } = useThemeMode();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const isDark    = darkMode;
  const pageBg    = isDark ? "#1A1F2E" : "#FFFFFF";
  const cardBg    = isDark ? "#252B3B" : "#EEF1F8";
  const textPri   = isDark ? "#F0F2FF" : "#1A1F3C";
  const textSec   = isDark ? "#7880A8" : "#8890B8";
  const border    = isDark ? "#2E3550" : "#E4E8F4";
  const borderFoc = isDark ? "#4F6BFF" : "#3A7BD5";
  const inputBg   = isDark ? "#1E2336" : "#FAFBFF";
  const accent    = "#22C55E";
  const accentTxt = "#FFFFFF";
  const cardShadow = isDark
    ? {}
    : {
        shadowColor: "#9BAAD4",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 6,
      };

  const handleLogin = async () => {
    if (!email || !password)
      return Alert.alert("Champs requis", "Remplis tous les champs.");
    try {
      setLoading(true);
      await login(email, password);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setLoading(false);
    }
  };

  const fieldTheme = { isDark, borderFoc, textPri, textSec, inputBg, border };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: pageBg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={pageBg} />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 24,
          justifyContent: "space-between",
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── LOGO ── */}
          <View style={{ alignItems: "center", marginBottom: 36 }}>
            <View style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              padding: 8,
            }}>
              <Image
                source={require("@/assets/images/flonotes.jpeg")}
                style={{ width: 130, height: 130, resizeMode: "contain", borderRadius: 16 }}
              />
            </View>
          </View>

          {/* ── CARTE FORMULAIRE ── */}
          <View style={{
            backgroundColor: cardBg,
            borderRadius: 20,
            padding: 24,
            marginBottom: 20,
            borderWidth: 1.5,       
            borderColor: "#FFFFFF",  
            ...cardShadow,
          }}>
            <Field
              id="email"
              label="Adresse email"
              value={email}
              onChange={setEmail}
              placeholder="vous@exemple.com"
              keyboard="email-address"
              icon="mail-outline"
              focusedField={focusedField}
              setFocusedField={setFocusedField}
              {...fieldTheme}
            />
            <Field
              id="password"
              label="Mot de passe"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              secure
              icon="lock-closed-outline"
              focusedField={focusedField}
              setFocusedField={setFocusedField}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              {...fieldTheme}
            />

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
              style={{
                flexDirection: "row",
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: accent,
                marginTop: 8,
                gap: 8,
              }}
            >
              {loading ? (
                <ActivityIndicator color={accentTxt} />
              ) : (
                <>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: accentTxt, letterSpacing: 0.2 }}>
                    Se connecter
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color={accentTxt} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Nouveau ? ── */}
          <Text style={{ textAlign: "center", color: textSec, fontSize: 13, marginBottom: 12 }}>
            Nouveau sur FloNotes ?
          </Text>

          {/* ── CARTE Créer un compte ── */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              activeOpacity={0.88}
              style={{
                backgroundColor: cardBg,
                borderRadius: 16,
                paddingVertical: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderWidth: 1.5,        
                borderColor: "#FFFFFF",  
                ...cardShadow,
              }}
            >
            <Text style={{ fontSize: 15, fontWeight: "700", color: textPri }}>
              Créer un compte
            </Text>
            <Ionicons name="person-add-outline" size={18} color={textPri} />
          </TouchableOpacity>

        </Animated.View>

        {/* ── FOOTER ── */}
        <Text style={{ textAlign: "center", color: textSec, fontSize: 12, marginTop: 28 }}>
          © 2026 FloNotes — Tous droits réservés
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}