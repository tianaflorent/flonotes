"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Check, ChevronDown, X } from "lucide-react-native";

import { useNotes } from "@/context/NotesContext";
import { useThemeMode } from "@/context/ThemeContext";
import NavbarBottom from "@/components/navigation/NavbarBottom";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────
type FormatState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  bgColor: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

const FONT_FAMILIES = [
  { label: "Par défaut", value: "System" },
  { label: "Serif", value: "serif" },
  { label: "Mono", value: "monospace" },
  { label: "Georgia", value: "Georgia" },
  { label: "Courier", value: "Courier" },
];

const TEXT_COLORS = [
  "#000000", "#FFFFFF", "#EF4444", "#F97316", "#EAB308",
  "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899", "#6B7280",
  "#1E293B", "#0EA5E9", "#10B981", "#F59E0B", "#DC2626",
];

const BG_COLORS = [
  "transparent", "#FEF9C3", "#DCFCE7", "#DBEAFE", "#FCE7F3",
  "#FEE2E2", "#F3E8FF", "#FFEDD5", "#E0F2FE", "#D1FAE5",
  "#1E1B4B", "#0F172A", "#042F2E", "#1C1917", "#1A1A1A",
];

// ─── ColorGrid ────────────────────────────────────────────────────────────────
const ColorGrid = ({
  colors,
  selected,
  onSelect,
}: {
  colors: string[];
  selected: string;
  onSelect: (c: string) => void;
}) => (
  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, padding: 8 }}>
    {colors.map((color) => {
      const isTransparent = color === "transparent";
      const isSelected = selected === color;
      return (
        <TouchableOpacity
          key={color}
          onPress={() => onSelect(color)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            backgroundColor: isTransparent ? undefined : color,
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? "#6366F1" : "#D1D5DB",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isTransparent && (
            <Text style={{ fontSize: 10, color: "#9CA3AF" }}>∅</Text>
          )}
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─── DropdownModal ────────────────────────────────────────────────────────────
const DropdownModal = ({
  visible,
  onClose,
  children,
  title,
  darkMode,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  darkMode: boolean;
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable
      style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
      onPress={onClose}
    >
      <Pressable
        style={{
          backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 12,
          paddingBottom: 32,
          maxHeight: "60%",
        }}
        onPress={() => {}}
      >
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: darkMode ? "#4B5563" : "#D1D5DB", alignSelf: "center", marginBottom: 12 }} />
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 8 }}>
          <Text style={{ fontWeight: "700", fontSize: 16, color: darkMode ? "#F9FAFB" : "#111827" }}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={20} color={darkMode ? "#9CA3AF" : "#6B7280"} />
          </TouchableOpacity>
        </View>
        {children}
      </Pressable>
    </Pressable>
  </Modal>
);

// ─── ToolBtn ──────────────────────────────────────────────────────────────────
const ToolBtn = ({
  onPress,
  active,
  darkMode,
  children,
}: {
  onPress: () => void;
  active?: boolean;
  darkMode: boolean;
  children: React.ReactNode;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={{
      minWidth: 36,
      height: 36,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6,
      backgroundColor: active ? (darkMode ? "#4F46E5" : "#EEF2FF") : "transparent",
    }}
  >
    {children}
  </TouchableOpacity>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Edit() {
  const { addNote } = useNotes();
  const { darkMode } = useThemeMode();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [format, setFormat] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    fontSize: 16,
    fontFamily: "System",
    textColor: darkMode ? "#F9FAFB" : "#111827",
    bgColor: "transparent",
  });

  const [showFontSize, setShowFontSize] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showBgColor, setShowBgColor] = useState(false);
  const [showColorPanel, setShowColorPanel] = useState(false);

  const navbarHeight = 72 + 50;
  const headerBg = darkMode ? "#000000" : "#FFFFFF";

  const toggle = (key: keyof Pick<FormatState, "bold" | "italic" | "underline" | "strikethrough">) =>
    setFormat((f) => ({ ...f, [key]: !f[key] }));

  const saveNote = () => {
      if (!title && !content) return;
      addNote(title || "Sans titre", content, format);
      setTitle("");
      setContent("");
      router.push("/");
    };

  const contentStyle = {
    fontWeight: format.bold ? ("700" as const) : ("400" as const),
    fontStyle: format.italic ? ("italic" as const) : ("normal" as const),
    textDecorationLine:
      format.underline && format.strikethrough
        ? ("underline line-through" as any)
        : format.underline
        ? ("underline" as const)
        : format.strikethrough
        ? ("line-through" as const)
        : ("none" as const),
    fontSize: format.fontSize,
    fontFamily: format.fontFamily === "System" ? undefined : format.fontFamily,
    color: format.textColor,
    backgroundColor: format.bgColor === "transparent" ? undefined : format.bgColor,
  };

  const divider = (
    <View style={{ width: 1, height: 22, backgroundColor: darkMode ? "#374151" : "#E5E7EB", marginHorizontal: 2 }} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: darkMode ? "#000000" : "#FFFFFF" }}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} backgroundColor={headerBg} />
      <View style={{ height: insets.top, backgroundColor: headerBg }} />

      <View style={{ flex: 1, backgroundColor: darkMode ? "#000000" : "#FFFFFF" }}>

        {/* HEADER */}
        <View style={{ paddingTop: 16, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 20, fontWeight: "600", color: darkMode ? "#FFFFFF" : "#111827" }}>
            Nouvelle note
          </Text>
          <TouchableOpacity
            onPress={saveNote}
            activeOpacity={0.8}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 999,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: darkMode ? "#374151" : "#111827",
            }}
          >
            <Check size={18} color="white" />
            <Text style={{ color: "white", marginLeft: 8, fontWeight: "500" }}>Enregistrer</Text>
          </TouchableOpacity>
        </View>

        {/* TOOLBAR */}
        <View
          style={{
            marginTop: 12,
            marginHorizontal: 12,
            borderRadius: 14,
            backgroundColor: darkMode ? "#111827" : "#F9FAFB",
            borderWidth: 1,
            borderColor: darkMode ? "#1F2937" : "#E5E7EB",
            paddingHorizontal: 8,
            paddingVertical: 6,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            {/* Palette */}
            <ToolBtn onPress={() => setShowColorPanel((v) => !v)} darkMode={darkMode} active={showColorPanel}>
              <View style={{ flexDirection: "row", gap: 3 }}>
                {["#EF4444", "#22C55E", "#3B82F6", "#EAB308"].map((c) => (
                  <View key={c} style={{ width: 5, height: 5, borderRadius: 99, backgroundColor: c }} />
                ))}
              </View>
            </ToolBtn>

            {divider}

            {/* Bold */}
            <ToolBtn onPress={() => toggle("bold")} active={format.bold} darkMode={darkMode}>
              <Text style={{ fontWeight: "800", fontSize: 15, color: format.bold ? "#6366F1" : darkMode ? "#D1D5DB" : "#374151" }}>B</Text>
            </ToolBtn>

            {/* Italic */}
            <ToolBtn onPress={() => toggle("italic")} active={format.italic} darkMode={darkMode}>
              <Text style={{ fontStyle: "italic", fontWeight: "600", fontSize: 15, color: format.italic ? "#6366F1" : darkMode ? "#D1D5DB" : "#374151" }}>I</Text>
            </ToolBtn>

            {/* Underline */}
            <ToolBtn onPress={() => toggle("underline")} active={format.underline} darkMode={darkMode}>
              <Text style={{ textDecorationLine: "underline", fontWeight: "600", fontSize: 15, color: format.underline ? "#6366F1" : darkMode ? "#D1D5DB" : "#374151" }}>U</Text>
            </ToolBtn>

            {/* Strikethrough */}
            <ToolBtn onPress={() => toggle("strikethrough")} active={format.strikethrough} darkMode={darkMode}>
              <Text style={{ textDecorationLine: "line-through", fontWeight: "600", fontSize: 15, color: format.strikethrough ? "#6366F1" : darkMode ? "#D1D5DB" : "#374151" }}>S</Text>
            </ToolBtn>

            {divider}

            {/* Font Family */}
            <TouchableOpacity
              onPress={() => setShowFontFamily(true)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                borderWidth: 1,
                borderColor: darkMode ? "#374151" : "#D1D5DB",
              }}
            >
              <Text style={{ fontSize: 12, color: darkMode ? "#D1D5DB" : "#374151", fontWeight: "600" }}>
                {FONT_FAMILIES.find((f) => f.value === format.fontFamily)?.label ?? "Police"}
              </Text>
              <ChevronDown size={12} color={darkMode ? "#9CA3AF" : "#6B7280"} />
            </TouchableOpacity>

            {/* Font Size */}
            <TouchableOpacity
              onPress={() => setShowFontSize(true)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                borderWidth: 1,
                borderColor: darkMode ? "#374151" : "#D1D5DB",
              }}
            >
              <Text style={{ fontSize: 12, color: darkMode ? "#D1D5DB" : "#374151", fontWeight: "600" }}>
                {format.fontSize}px
              </Text>
              <ChevronDown size={12} color={darkMode ? "#9CA3AF" : "#6B7280"} />
            </TouchableOpacity>

            {divider}

            {/* Text Color */}
            <ToolBtn onPress={() => setShowTextColor(true)} darkMode={darkMode}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: format.textColor === "transparent" ? (darkMode ? "#D1D5DB" : "#374151") : format.textColor }}>A</Text>
                <View style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: format.textColor === "transparent" ? "#6B7280" : format.textColor, marginTop: 1 }} />
              </View>
            </ToolBtn>

            {/* Bg Color */}
            <ToolBtn onPress={() => setShowBgColor(true)} darkMode={darkMode}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: darkMode ? "#D1D5DB" : "#374151" }}>A</Text>
                <View
                  style={{
                    width: 16,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: format.bgColor === "transparent" ? "transparent" : format.bgColor,
                    borderWidth: format.bgColor === "transparent" ? 1 : 0,
                    borderColor: "#9CA3AF",
                    marginTop: 1,
                  }}
                />
              </View>
            </ToolBtn>
          </ScrollView>

          {/* Inline color panel */}
          {showColorPanel && (
            <View style={{ borderTopWidth: 1, borderTopColor: darkMode ? "#1F2937" : "#E5E7EB", marginTop: 6, paddingTop: 6 }}>
              <Text style={{ fontSize: 11, color: darkMode ? "#9CA3AF" : "#6B7280", paddingHorizontal: 4, marginBottom: 4, fontWeight: "600" }}>
                COULEUR TEXTE
              </Text>
              <ColorGrid colors={TEXT_COLORS} selected={format.textColor} onSelect={(c) => setFormat((f) => ({ ...f, textColor: c }))} />
              <Text style={{ fontSize: 11, color: darkMode ? "#9CA3AF" : "#6B7280", paddingHorizontal: 4, marginTop: 8, marginBottom: 4, fontWeight: "600" }}>
                FOND DU TEXTE
              </Text>
              <ColorGrid colors={BG_COLORS} selected={format.bgColor} onSelect={(c) => setFormat((f) => ({ ...f, bgColor: c }))} />
            </View>
          )}
        </View>

        {/* CONTENT */}
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 16, marginTop: 16 }}
          contentContainerStyle={{ paddingBottom: navbarHeight + 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            placeholder="Titre"
            value={title}
            onChangeText={setTitle}
            style={{ fontSize: 22, fontWeight: "700", marginBottom: 16, color: darkMode ? "#FFFFFF" : "#111827" }}
            placeholderTextColor="#9CA3AF"
          />
          <TextInput
            placeholder="Commence à écrire..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            style={[{ minHeight: 300, lineHeight: format.fontSize * 1.6 }, contentStyle]}
            placeholderTextColor="#9CA3AF"
          />
        </ScrollView>

        <NavbarBottom active="edit" />
      </View>

      <View style={{ height: insets.bottom, backgroundColor: darkMode ? "#FFFFFF" : "#F3F4F6" }} />

      {/* MODALS */}

      {/* Font Size */}
      <DropdownModal visible={showFontSize} onClose={() => setShowFontSize(false)} title="Taille de police" darkMode={darkMode}>
        <FlatList
          data={FONT_SIZES}
          keyExtractor={(item) => String(item)}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => { setFormat((f) => ({ ...f, fontSize: item })); setShowFontSize(false); }}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: darkMode ? "#374151" : "#F3F4F6",
              }}
            >
              <Text style={{ fontSize: item, color: darkMode ? "#F9FAFB" : "#111827" }}>{item}px</Text>
              {format.fontSize === item && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#6366F1" }} />
              )}
            </TouchableOpacity>
          )}
        />
      </DropdownModal>

      {/* Font Family */}
      <DropdownModal visible={showFontFamily} onClose={() => setShowFontFamily(false)} title="Type de police" darkMode={darkMode}>
        <FlatList
          data={FONT_FAMILIES}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => { setFormat((f) => ({ ...f, fontFamily: item.value })); setShowFontFamily(false); }}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: darkMode ? "#374151" : "#F3F4F6",
              }}
            >
              <Text style={{
                fontSize: 16,
                fontFamily: item.value === "System" ? undefined : item.value,
                color: darkMode ? "#F9FAFB" : "#111827",
                fontWeight: format.fontFamily === item.value ? "700" : "400",
              }}>
                {item.label}
              </Text>
              {format.fontFamily === item.value && (
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#6366F1" }} />
              )}
            </TouchableOpacity>
          )}
        />
      </DropdownModal>

      {/* Text Color */}
      <DropdownModal visible={showTextColor} onClose={() => setShowTextColor(false)} title="Couleur du texte" darkMode={darkMode}>
        <ColorGrid
          colors={TEXT_COLORS}
          selected={format.textColor}
          onSelect={(c) => { setFormat((f) => ({ ...f, textColor: c })); setShowTextColor(false); }}
        />
      </DropdownModal>

      {/* Bg Color */}
      <DropdownModal visible={showBgColor} onClose={() => setShowBgColor(false)} title="Fond du texte" darkMode={darkMode}>
        <ColorGrid
          colors={BG_COLORS}
          selected={format.bgColor}
          onSelect={(c) => { setFormat((f) => ({ ...f, bgColor: c })); setShowBgColor(false); }}
        />
      </DropdownModal>
    </View>
  );
}













