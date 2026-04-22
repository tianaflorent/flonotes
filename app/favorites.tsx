"use client";

import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useNotes } from "@/context/NotesContext";
import NavbarBottom from "@/components/navigation/NavbarBottom";
import { Star, Sparkles } from "lucide-react-native";
import { useThemeMode } from "@/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function NoteCard({
  note,
  darkMode,
  index,
}: {
  note: any;
  darkMode: boolean;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const accentColors = [
    darkMode ? "#F59E0B" : "#F59E0B",
    darkMode ? "#34D399" : "#10B981",
    darkMode ? "#818CF8" : "#6366F1",
    darkMode ? "#F472B6" : "#EC4899",
    darkMode ? "#38BDF8" : "#0EA5E9",
  ];
  const accent = accentColors[index % accentColors.length];

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        width: "48%",
        marginBottom: 14,
      }}
    >
      <View
        style={{
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: darkMode ? "#111111" : "#FFFFFF",
          shadowColor: darkMode ? "#000" : "#94A3B8",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: darkMode ? 0.6 : 0.15,
          shadowRadius: 12,
          elevation: 6,
          borderWidth: 1,
          borderColor: darkMode ? "#1F1F1F" : "#F1F5F9",
        }}
      >
        {/* Accent top bar */}
        <View
          style={{
            height: 3,
            backgroundColor: accent,
            opacity: 0.9,
          }}
        />

        <View style={{ padding: 14 }}>
          {/* Star badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                backgroundColor: accent + "22",
                borderRadius: 8,
                padding: 4,
              }}
            >
              <Star size={11} color={accent} fill={accent} />
            </View>
          </View>

          <Text
            style={{
              fontWeight: "700",
              fontSize: 14,
              letterSpacing: -0.3,
              color: darkMode ? "#F9FAFB" : "#111827",
              marginBottom: 6,
            }}
            numberOfLines={2}
          >
            {note.title}
          </Text>

          <Text
            style={{
              fontSize: 12,
              lineHeight: 18,
              color: darkMode ? "#6B7280" : "#9CA3AF",
            }}
            numberOfLines={5}
          >
            {note.content}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function Favorites() {
  const { notes } = useNotes();
  const { darkMode } = useThemeMode();
  const insets = useSafeAreaInsets();

  const navbarHeight = 72 + 50;
  const headerBg = darkMode ? "#000000" : "#F8FAFC";

  const favorites = notes.filter((note) => note.favorite);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: headerBg,
      }}
    >
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={headerBg}
      />

      {/* Safe area top */}
      <View style={{ height: insets.top, backgroundColor: headerBg }} />

      <View
        style={{
          flex: 1,
          backgroundColor: darkMode ? "#000000" : "#F1F5F9",
        }}
      >
        {/* HEADER */}
        <Animated.View
          style={{
            opacity: headerFade,
            transform: [{ translateY: headerSlide }],
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 18,
            backgroundColor: darkMode ? "#000000" : "#F8FAFC",
            borderBottomWidth: 1,
            borderBottomColor: darkMode ? "#1A1A1A" : "#E2E8F0",
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
          >
            <View
              style={{
                backgroundColor: darkMode ? "#1A1A1A" : "#FEF3C7",
                borderRadius: 12,
                padding: 8,
              }}
            >
              <Star
                size={20}
                color={darkMode ? "#F59E0B" : "#D97706"}
                fill={darkMode ? "#F59E0B" : "#D97706"}
              />
            </View>

            <View>
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "800",
                  letterSpacing: -0.8,
                  color: darkMode ? "#F9FAFB" : "#0F172A",
                }}
              >
                Favoris
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: darkMode ? "#4B5563" : "#94A3B8",
                  marginTop: 1,
                  letterSpacing: 0.2,
                }}
              >
                {favorites.length}{" "}
                {favorites.length === 1 ? "note sauvegardée" : "notes sauvegardées"}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* CONTENT */}
        <ScrollView
          contentContainerStyle={{
            paddingBottom: navbarHeight + 20,
            paddingHorizontal: 14,
            paddingTop: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          {favorites.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                marginTop: 80,
                paddingHorizontal: 32,
              }}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 24,
                  backgroundColor: darkMode ? "#111111" : "#F8FAFC",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: darkMode ? "#1F1F1F" : "#E2E8F0",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <Star size={30} color={darkMode ? "#374151" : "#CBD5E1"} />
              </View>

              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: darkMode ? "#374151" : "#94A3B8",
                  letterSpacing: -0.3,
                  marginBottom: 6,
                }}
              >
                Aucun favori
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: darkMode ? "#374151" : "#CBD5E1",
                  textAlign: "center",
                  lineHeight: 19,
                }}
              >
                Marquez des notes avec une étoile pour les retrouver ici.
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {favorites.map((note, index) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  darkMode={darkMode}
                  index={index}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <NavbarBottom active="favorites" />
      </View>

      {/* Safe area bottom */}
      <View
        style={{
          height: insets.bottom,
          backgroundColor: darkMode ? "#FFFFFF" : "#F1F5F9",
        }}
      />
    </View>
  );
}
