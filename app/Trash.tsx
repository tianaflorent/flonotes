"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useNotes } from "@/context/NotesContext";
import NavbarBottom from "@/components/navigation/NavbarBottom";
import { Star, Trash2, Copy, ArrowLeft } from "lucide-react-native";
import { useThemeMode } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TrashPage() {
  const { notes, favoriteNotes } = useNotes();
  const { darkMode } = useThemeMode();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>([]);
  const isSelectionMode = selected.length > 0;

  const navbarHeight = 72 + 50;
  const headerBg = darkMode ? "#1F2937" : "#FFFFFF";

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelected([]);

  const handleFavorite = () => {
    favoriteNotes(selected);
    clearSelection();
  };

  const trashedNotes = notes.filter((note) => note.trashed);

  return (
    <View style={{ flex: 1, backgroundColor: darkMode ? "#000000" : "#FFFFFF" }}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={headerBg}
      />

      {/* Safe area top */}
      <View style={{ height: insets.top, backgroundColor: headerBg }} />

      <View className={`flex-1 ${darkMode ? "bg-black" : "bg-gray-100"}`}>

        {/* HEADER */}
        <View className={`px-4 pt-4 pb-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          {isSelectionMode ? (
            <View className="flex-row items-center justify-between">
              <Text className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {selected.length} sélectionnée(s)
              </Text>
              <TouchableOpacity onPress={clearSelection}>
                <Text className="text-gray-500">Annuler</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => router.push("/")} className="mr-4 p-2">
                <ArrowLeft size={24} color={darkMode ? "white" : "black"} />
              </TouchableOpacity>
              <Text className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                Corbeille
              </Text>
            </View>
          )}
        </View>

        {/* ACTION BAR */}
        {isSelectionMode && (
          <View className={`flex-row justify-around items-center py-3 border-b ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <TouchableOpacity onPress={handleFavorite}>
              <Star size={20} color={darkMode ? "white" : "#111827"} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Trash2 size={20} color="#DC2626" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Copy size={20} color={darkMode ? "white" : "#111827"} />
            </TouchableOpacity>
          </View>
        )}

        {/* NOTES */}
        <ScrollView contentContainerStyle={{ paddingBottom: navbarHeight + 20 }} className="px-3">
          {trashedNotes.length === 0 ? (
            <View className="items-center mt-20">
              <Text className={`${darkMode ? "text-gray-400" : "text-gray-400"} text-base`}>
                Aucune note dans la corbeille
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between mt-4">
              {trashedNotes.map((note) => {
                const isSelected = selected.includes(note.id);
                return (
                  <TouchableOpacity
                    key={note.id}
                    onLongPress={() => toggleSelect(note.id)}
                    onPress={() => isSelectionMode && toggleSelect(note.id)}
                    activeOpacity={0.9}
                    className={`w-[48%] mb-4 rounded-3xl p-4 ${
                      isSelected
                        ? "bg-blue-50 border-2 border-blue-500"
                        : darkMode
                        ? "bg-gray-700"
                        : "bg-white"
                    }`}
                  >
                    <Text className={`font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {note.title}
                    </Text>
                    <Text className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`} numberOfLines={5}>
                      {note.content}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        <NavbarBottom active="home" />
      </View>

      {/* Safe area bottom */}
      <View style={{ height: insets.bottom, backgroundColor: darkMode ? "#FFFFFF" : "#F3F4F6" }} />
    </View>
  );
}