"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
} from "react-native";
import { Search as SearchIcon, X, FileText } from "lucide-react-native";
import { useRouter } from "expo-router";

import { useNotes } from "@/context/NotesContext";
import { useThemeMode } from "@/context/ThemeContext";
import NavbarBottom from "@/components/navigation/NavbarBottom";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const accentColors = [
  "#F59E0B",
  "#10B981",
  "#6366F1",
  "#EC4899",
  "#0EA5E9",
];

function NoteCard({
  note,
  darkMode,
  index,
  onPress,
}: {
  note: any;
  darkMode: boolean;
  index: number;
  onPress: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 340,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 340,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
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
        <View style={{ height: 3, backgroundColor: accent }} />

        <View style={{ padding: 14 }}>
          {/* Category dot */}
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: accent,
              marginBottom: 8,
              opacity: 0.8,
            }}
          />

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
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Search() {
  const { notes } = useNotes();
  const { darkMode } = useThemeMode();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const navbarHeight = 72 + 50;
  const headerBg = darkMode ? "#000000" : "#F8FAFC";

  const filteredNotes = notes.filter(
    (note) =>
      !note.trashed &&
      (note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase()))
  );

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
    <View style={{ flex: 1, backgroundColor: headerBg }}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={headerBg}
      />

      {/* Safe area top */}
      <View style={{ height: insets.top, backgroundColor: headerBg }} />

      <View style={{ flex: 1, backgroundColor: darkMode ? "#000000" : "#F1F5F9" }}>

        {/* HEADER */}
        <Animated.View
          style={{
            opacity: headerFade,
            transform: [{ translateY: headerSlide }],
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 16,
            backgroundColor: darkMode ? "#000000" : "#F8FAFC",
            borderBottomWidth: 1,
            borderBottomColor: darkMode ? "#1A1A1A" : "#E2E8F0",
          }}
        >
          {/* Title row */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <View
              style={{
                backgroundColor: darkMode ? "#1A1A1A" : "#EFF6FF",
                borderRadius: 12,
                padding: 8,
              }}
            >
              <SearchIcon size={20} color={darkMode ? "#60A5FA" : "#3B82F6"} />
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
                Recherche
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: darkMode ? "#4B5563" : "#94A3B8",
                  marginTop: 1,
                  letterSpacing: 0.2,
                }}
              >
                {query
                  ? `${filteredNotes.length} résultat${filteredNotes.length !== 1 ? "s" : ""}`
                  : `${notes.filter((n) => !n.trashed).length} notes disponibles`}
              </Text>
            </View>
          </View>

          {/* SEARCH BAR */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderRadius: 16,
              backgroundColor: darkMode ? "#111111" : "#FFFFFF",
              borderWidth: 1,
              borderColor: darkMode ? "#FFFFFF" : "#E2E8F0",
              shadowColor: darkMode ? "#000" : "#94A3B8",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: darkMode ? 0.4 : 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <SearchIcon size={18} color={darkMode ? "#FFFFFF" : "#94A3B8"} />
            <TextInput
              placeholder="Rechercher une note..."
              value={query}
              onChangeText={setQuery}
              style={{
                marginLeft: 10,
                flex: 1,
                fontSize: 14,
                color: darkMode ? "#FFFFFF" : "#1E293B",
                letterSpacing: 0.1,
              }}
              placeholderTextColor={darkMode ? "#374151" : "#CBD5E1"}
            />
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => setQuery("")}
                style={{
                  backgroundColor: darkMode ? "#1F1F1F" : "#F1F5F9",
                  borderRadius: 10,
                  padding: 4,
                }}
              >
                <X size={14} color={darkMode ? "#6B7280" : "#94A3B8"} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* RESULTS */}
        <ScrollView
          contentContainerStyle={{
            paddingBottom: navbarHeight + 20,
            paddingHorizontal: 14,
            paddingTop: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          {filteredNotes.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 80, paddingHorizontal: 32 }}>
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
                <FileText size={28} color={darkMode ? "#374151" : "#CBD5E1"} />
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
                {query ? "Aucun résultat" : "Commencez à taper"}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: darkMode ? "#374151" : "#CBD5E1",
                  textAlign: "center",
                  lineHeight: 19,
                }}
              >
                {query
                  ? `Aucune note ne correspond à "${query}".`
                  : "Entrez un mot-clé pour trouver vos notes."}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
              {filteredNotes.map((note, index) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  darkMode={darkMode}
                  index={index}
                  onPress={() => router.push(`/note/${note.id}`)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <NavbarBottom active="search" />
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
