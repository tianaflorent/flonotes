"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from "react-native";
import { Trash2, Info, CalendarDays, ArrowLeft } from "lucide-react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useNotes } from "@/context/NotesContext";
import { useRouter } from "expo-router";
import { useThemeMode } from "@/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsPage() {
  const { notes, trashNotes } = useNotes();
  const router = useRouter();
  const { darkMode } = useThemeMode();
  const insets = useSafeAreaInsets();
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [filteredNotes, setFilteredNotes] = useState<typeof notes>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDeleteAllNotes = () => {
    if (notes.length === 0) return;

    Alert.alert(
      "Supprimer toutes les notes",
      "Êtes-vous sûr de vouloir déplacer toutes vos notes à la corbeille ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            const allNoteIds = notes.map((n) => n.id);
            trashNotes(allNoteIds);
            Alert.alert(
              "Notes supprimées",
              "Toutes vos notes ont été déplacées à la corbeille."
            );
          },
        },
      ]
    );
  };

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);

  const handleConfirm = (date: Date) => {
    hideDatePicker();
    const dateStr = date.toISOString().split("T")[0];
    setSelectedDate(dateStr);

    const filtered = notes.filter((n) => n.date?.startsWith(dateStr));
    setFilteredNotes(filtered);
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, paddingTop: 60 }} 
      className={`flex-1 ${darkMode ? "bg-black" : "bg-gray-100"}`}
    >
      <View className="flex-row items-center mb-6">
        {/* 🔹 BOUTON RETOUR */}
        <TouchableOpacity
          onPress={() => router.push("/")} 
          className="mr-4 p-2"
        >
          <ArrowLeft size={24} color={darkMode ? "white" : "black"} />
        </TouchableOpacity>
        <Text className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Paramètres
        </Text>
      </View>

      {/* Trier par date */}
      <TouchableOpacity
        onPress={showDatePicker}
        className={`flex-row justify-between items-center py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-300"}`}
      >
        <View className="flex-row items-center">
          <CalendarDays size={22} color={darkMode ? "white" : "#111827"} />
          <Text className={`ml-3 text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
            Trier par date
          </Text>
        </View>
        <Text className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {selectedDate || "Choisir une date"}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

      {/* Notes filtrées */}
      {selectedDate && (
        <View className="mt-4">
          {filteredNotes.length === 0 ? (
            <Text className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Aucune note pour cette date
            </Text>
          ) : (
            <FlatList
              data={filteredNotes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const dateObj = new Date(item.date);
                const formattedDate = dateObj.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                const formattedTime = dateObj.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <TouchableOpacity
                    onPress={() => router.push(`/note/${item.id}`)}
                    className={`rounded-xl p-4 mb-3 shadow ${darkMode ? "bg-gray-700" : "bg-white"}`}
                  >
                    <Text className={`font-bold text-lg mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {item.title}
                    </Text>
                    <Text className={`${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`} numberOfLines={1}>
                      {item.content}
                    </Text>
                    <Text className={`${darkMode ? "text-gray-400" : "text-gray-400"} text-sm`}>
                      {formattedDate} • {formattedTime}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      )}

      {/* Supprimer toutes les notes */}
      <TouchableOpacity
        onPress={handleDeleteAllNotes}
        className={`flex-row items-center py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-300"}`}
      >
        <Trash2 size={22} color="#DC2626" />
        <Text className="ml-4 text-lg text-red-600">
          Supprimer toutes les notes
        </Text>
      </TouchableOpacity>

      {/* À propos */}
      <TouchableOpacity
        onPress={() => alert("FloNotes est une application mobile \nCréée avec React Native \nDéveloppé par TIANA Florent")}
        className={`flex-row items-center py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-300"}`}
      >
        <Info size={22} color={darkMode ? "white" : "#111827"} />
        <Text className={`ml-4 text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
          À propos
        </Text>
      </TouchableOpacity>
    </ScrollView>
    
  );
}