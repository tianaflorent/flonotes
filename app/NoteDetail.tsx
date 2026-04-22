"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { useRouter, useSearchParams } from "expo-router";
import { useNotes } from "@/context/NotesContext";
import NavbarBottom from "@/components/navigation/NavbarBottom";
import { Check, ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NoteDetail() {
  const { notes, updateNote } = useNotes();
  const { id } = useSearchParams(); // Récupère l'ID de la note
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });

  // Charger la note existante
  useEffect(() => {
    if (!id) return;
    const note = notes.find((n) => n.id === id);
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [id, notes]);

  // Afficher un toast
  const showToast = (message: string) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2000);
  };

  const handleSave = () => {
    if (!id) return;
    updateNote(id, title, content);
    showToast("Note enregistrée ✅");
    router.back();
  };

  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text className="text-gray-500">Note introuvable</Text>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      {/* HEADER */}
      <View
        className={`flex-row items-center justify-between px-4 pt-14 pb-4 ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={darkMode ? "white" : "black"} />
        </TouchableOpacity>
        <Text className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Modifier
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Check size={24} color={darkMode ? "white" : "black"} />
        </TouchableOpacity>
      </View>

      {/* NOTE EDIT */}
      <ScrollView contentContainerStyle={{ paddingBottom: 160 }} className="px-4">
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Titre de la note"
          placeholderTextColor={darkMode ? "#D1D5DB" : "#9CA3AF"}
          className={`text-2xl font-bold mb-4 ${
            darkMode ? "text-white bg-gray-700 rounded-xl px-4 py-2" : "text-gray-900 bg-white rounded-xl px-4 py-2"
          }`}
        />
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Contenu de la note..."
          placeholderTextColor={darkMode ? "#D1D5DB" : "#9CA3AF"}
          multiline
          className={`text-base ${
            darkMode ? "text-white bg-gray-700 rounded-xl px-4 py-2 h-64" : "text-gray-900 bg-white rounded-xl px-4 py-2 h-64"
          }`}
        />

        {/* MODE SOMBRE */}
        <View className="flex-row justify-between items-center mt-6">
          <Text className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
            Mode sombre
          </Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            thumbColor={darkMode ? "#fff" : "#111827"}
            trackColor={{ false: "#d1d5db", true: "#4b5563" }}
          />
        </View>
      </ScrollView>

      {/* TOAST */}
      {toast.visible && (
        <View className="absolute bottom-28 left-6 right-6 items-center">
          <View className="flex-row items-center px-4 py-3 rounded-full bg-gray-900 shadow-lg">
            <Text className="text-white text-sm font-medium">{toast.message}</Text>
          </View>
        </View>
      )}

      <NavbarBottom active="home" />
      
    </View>
    
  );
}