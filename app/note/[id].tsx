"use client";

import React, { useState, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { Check, ArrowLeft, Clock, ChevronDown, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useNotes } from "@/context/NotesContext";
import { useThemeMode } from "@/context/ThemeContext";
import NavbarBottom from "@/components/navigation/NavbarBottom";

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
  { label: "Serif",      value: "serif" },
  { label: "Mono",       value: "monospace" },
  { label: "Georgia",    value: "Georgia" },
  { label: "Courier",    value: "Courier" },
];

const TEXT_COLORS = [
  "#000000","#FFFFFF","#EF4444","#F97316","#EAB308",
  "#22C55E","#3B82F6","#8B5CF6","#EC4899","#6B7280",
  "#1E293B","#0EA5E9","#10B981","#F59E0B","#DC2626",
];

const BG_COLORS = [
  "transparent","#FEF9C3","#DCFCE7","#DBEAFE","#FCE7F3",
  "#FEE2E2","#F3E8FF","#FFEDD5","#E0F2FE","#D1FAE5",
  "#1E1B4B","#0F172A","#042F2E","#1C1917","#1A1A1A",
];

// ─── ColorGrid ────────────────────────────────────────────────────────────────
const ColorGrid = ({
  colors, selected, onSelect,
}: {
  colors: string[]; selected: string; onSelect: (c: string) => void;
}) => (
  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, padding: 12 }}>
    {colors.map((color) => {
      const isTransparent = color === "transparent";
      const isSelected = selected === color;
      return (
        <TouchableOpacity
          key={color}
          onPress={() => onSelect(color)}
          style={{
            width: 32, height: 32, borderRadius: 8,
            backgroundColor: isTransparent ? undefined : color,
            borderWidth: isSelected ? 2.5 : 1,
            borderColor: isSelected ? "#6366F1" : "#333333",
            alignItems: "center", justifyContent: "center",
          }}
        >
          {isTransparent && <Text style={{ fontSize: 11, color: "#555" }}>∅</Text>}
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─── DropdownModal ────────────────────────────────────────────────────────────
const DropdownModal = ({
  visible, onClose, children, title, darkMode,
}: {
  visible: boolean; onClose: () => void; children: React.ReactNode; title: string; darkMode: boolean;
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable
      style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}
      onPress={onClose}
    >
      <Pressable
        style={{
          backgroundColor: darkMode ? "#0D0D0D" : "#FFFFFF",
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          paddingTop: 12, paddingBottom: 36, maxHeight: "65%",
          borderTopWidth: 1, borderColor: darkMode ? "#1A1A1A" : "#F0F0F0",
        }}
        onPress={() => {}}
      >
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: darkMode ? "#333" : "#DDD", alignSelf: "center", marginBottom: 16 }} />
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 8 }}>
          <Text style={{ fontWeight: "700", fontSize: 17, color: darkMode ? "#FFFFFF" : "#0A0A0A", letterSpacing: -0.3 }}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={{ width: 32, height: 32, borderRadius: 99, backgroundColor: darkMode ? "#1A1A1A" : "#F5F5F5", alignItems: "center", justifyContent: "center" }}>
            <X size={16} color={darkMode ? "#888" : "#555"} />
          </TouchableOpacity>
        </View>
        {children}
      </Pressable>
    </Pressable>
  </Modal>
);

// ─── ToolBtn ──────────────────────────────────────────────────────────────────
const ToolBtn = ({
  onPress, active, darkMode, children,
}: {
  onPress: () => void; active?: boolean; darkMode: boolean; children: React.ReactNode;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={{
      minWidth: 38, height: 38, borderRadius: 10,
      alignItems: "center", justifyContent: "center", paddingHorizontal: 8,
      backgroundColor: active ? (darkMode ? "#1E1E2E" : "#EEF2FF") : "transparent",
      borderWidth: active ? 1 : 0,
      borderColor: active ? "#6366F1" : "transparent",
    }}
  >
    {children}
  </TouchableOpacity>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function NoteDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { notes, updateNote } = useNotes();
  const { darkMode } = useThemeMode();
  const insets = useSafeAreaInsets();

  const note = notes.find((n) => n.id === id);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const [format, setFormat] = useState<FormatState>({
    bold: false, italic: false, underline: false, strikethrough: false,
    fontSize: 17, fontFamily: "System",
    textColor: darkMode ? "#CCCCCC" : "#333333",
    bgColor: "transparent",
  });

  const [showFontSize,   setShowFontSize]   = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showTextColor,  setShowTextColor]  = useState(false);
  const [showBgColor,    setShowBgColor]    = useState(false);
  const [showColorPanel, setShowColorPanel] = useState(false);

  // Même calcul que edit.tsx
  const navbarHeight = 72 + 50 ;

  useEffect(() => {
    if (note) { setTitle(note.title); setContent(note.content); }
  }, [note]);

  const toggle = (key: keyof Pick<FormatState, "bold"|"italic"|"underline"|"strikethrough">) =>
    setFormat((f) => ({ ...f, [key]: !f[key] }));

  const handleSave = () => {
    if (!title && !content) return;
    updateNote(id as string, title, content);
    router.replace("/");
  };

  const bg      = darkMode ? "#000000" : "#FAFAFA";
  const surface = darkMode ? "#0D0D0D" : "#FFFFFF";
  const border  = darkMode ? "#1A1A1A" : "#F0F0F0";
  const textPri = darkMode ? "#FFFFFF" : "#0A0A0A";
  const textSec = darkMode ? "#555555" : "#AAAAAA";
  const pill    = darkMode ? "#111111" : "#000000";

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const updatedAt = note?.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const contentStyle = {
    fontWeight: format.bold ? ("700" as const) : ("400" as const),
    fontStyle: format.italic ? ("italic" as const) : ("normal" as const),
    textDecorationLine:
      format.underline && format.strikethrough ? ("underline line-through" as any)
      : format.underline ? ("underline" as const)
      : format.strikethrough ? ("line-through" as const)
      : ("none" as const),
    fontSize: format.fontSize,
    fontFamily: format.fontFamily === "System" ? undefined : format.fontFamily,
    color: format.textColor,
    backgroundColor: format.bgColor === "transparent" ? undefined : format.bgColor,
  };

  const divider = (
    <View style={{ width: 1, height: 22, backgroundColor: darkMode ? "#222" : "#E5E7EB", marginHorizontal: 2 }} />
  );

  if (!note) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: bg }}>
        <Text style={{ color: textSec, fontSize: 16 }}>Note introuvable</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} backgroundColor={bg} />
      <View style={{ height: insets.top, backgroundColor: bg }} />

      {/* ── HEADER ── */}
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: border,
        backgroundColor: surface,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.6}
          style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: darkMode ? "#1A1A1A" : "#F5F5F5", alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft size={20} color={textPri} />
        </TouchableOpacity>

        <Text style={{ fontSize: 15, fontWeight: "600", color: textSec, letterSpacing: 0.5 }}>
          MODIFIER
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.8}
          style={{
            flexDirection: "row", alignItems: "center", gap: 6,
            backgroundColor: hasChanges ? pill : (darkMode ? "#1A1A1A" : "#E5E5E5"),
            paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
          }}
        >
          <Check size={16} color={hasChanges ? "#FFFFFF" : textSec} strokeWidth={2.5} />
          <Text style={{ color: hasChanges ? "#FFFFFF" : textSec, fontWeight: "600", fontSize: 14 }}>
            Sauvegarder
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── TOOLBAR ── */}
      <View style={{
        marginHorizontal: 12, marginTop: 10,
        borderRadius: 14, backgroundColor: surface,
        borderWidth: 1, borderColor: border,
        paddingHorizontal: 8, paddingVertical: 6,
      }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <ToolBtn onPress={() => setShowColorPanel(v => !v)} darkMode={darkMode} active={showColorPanel}>
            <View style={{ flexDirection: "row", gap: 3 }}>
              {["#EF4444","#22C55E","#3B82F6","#EAB308"].map(c => (
                <View key={c} style={{ width: 5, height: 5, borderRadius: 99, backgroundColor: c }} />
              ))}
            </View>
          </ToolBtn>

          {divider}

          <ToolBtn onPress={() => toggle("bold")} active={format.bold} darkMode={darkMode}>
            <Text style={{ fontWeight: "800", fontSize: 15, color: format.bold ? "#6366F1" : darkMode ? "#CCCCCC" : "#374151" }}>B</Text>
          </ToolBtn>

          <ToolBtn onPress={() => toggle("italic")} active={format.italic} darkMode={darkMode}>
            <Text style={{ fontStyle: "italic", fontWeight: "600", fontSize: 15, color: format.italic ? "#6366F1" : darkMode ? "#CCCCCC" : "#374151" }}>I</Text>
          </ToolBtn>

          <ToolBtn onPress={() => toggle("underline")} active={format.underline} darkMode={darkMode}>
            <Text style={{ textDecorationLine: "underline", fontWeight: "600", fontSize: 15, color: format.underline ? "#6366F1" : darkMode ? "#CCCCCC" : "#374151" }}>U</Text>
          </ToolBtn>

          <ToolBtn onPress={() => toggle("strikethrough")} active={format.strikethrough} darkMode={darkMode}>
            <Text style={{ textDecorationLine: "line-through", fontWeight: "600", fontSize: 15, color: format.strikethrough ? "#6366F1" : darkMode ? "#CCCCCC" : "#374151" }}>S</Text>
          </ToolBtn>

          {divider}

          <TouchableOpacity
            onPress={() => setShowFontFamily(true)}
            activeOpacity={0.7}
            style={{
              flexDirection: "row", alignItems: "center", gap: 4,
              paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
              backgroundColor: darkMode ? "#1A1A1A" : "#F5F5F5",
              borderWidth: 1, borderColor: darkMode ? "#2A2A2A" : "#E5E5E5",
            }}
          >
            <Text style={{ fontSize: 12, color: darkMode ? "#CCCCCC" : "#374151", fontWeight: "600" }}>
              {FONT_FAMILIES.find(f => f.value === format.fontFamily)?.label ?? "Police"}
            </Text>
            <ChevronDown size={12} color={darkMode ? "#666" : "#999"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowFontSize(true)}
            activeOpacity={0.7}
            style={{
              flexDirection: "row", alignItems: "center", gap: 4,
              paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
              backgroundColor: darkMode ? "#1A1A1A" : "#F5F5F5",
              borderWidth: 1, borderColor: darkMode ? "#2A2A2A" : "#E5E5E5",
            }}
          >
            <Text style={{ fontSize: 12, color: darkMode ? "#CCCCCC" : "#374151", fontWeight: "600" }}>
              {format.fontSize}px
            </Text>
            <ChevronDown size={12} color={darkMode ? "#666" : "#999"} />
          </TouchableOpacity>

          {divider}

          <ToolBtn onPress={() => setShowTextColor(true)} darkMode={darkMode}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 14, fontWeight: "800", color: format.textColor === "transparent" ? (darkMode ? "#CCC" : "#374151") : format.textColor }}>A</Text>
              <View style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: format.textColor === "transparent" ? "#666" : format.textColor, marginTop: 1 }} />
            </View>
          </ToolBtn>

          <ToolBtn onPress={() => setShowBgColor(true)} darkMode={darkMode}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: darkMode ? "#CCCCCC" : "#374151" }}>A</Text>
              <View style={{
                width: 16, height: 3, borderRadius: 2, marginTop: 1,
                backgroundColor: format.bgColor === "transparent" ? "transparent" : format.bgColor,
                borderWidth: format.bgColor === "transparent" ? 1 : 0,
                borderColor: "#555",
              }} />
            </View>
          </ToolBtn>
        </ScrollView>

        {showColorPanel && (
          <View style={{ borderTopWidth: 1, borderTopColor: darkMode ? "#1A1A1A" : "#F0F0F0", marginTop: 6, paddingTop: 6 }}>
            <Text style={{ fontSize: 11, color: textSec, paddingHorizontal: 4, marginBottom: 2, fontWeight: "700", letterSpacing: 0.5 }}>
              COULEUR TEXTE
            </Text>
            <ColorGrid colors={TEXT_COLORS} selected={format.textColor} onSelect={c => setFormat(f => ({ ...f, textColor: c }))} />
            <Text style={{ fontSize: 11, color: textSec, paddingHorizontal: 4, marginTop: 6, marginBottom: 2, fontWeight: "700", letterSpacing: 0.5 }}>
              FOND DU TEXTE
            </Text>
            <ColorGrid colors={BG_COLORS} selected={format.bgColor} onSelect={c => setFormat(f => ({ ...f, bgColor: c }))} />
          </View>
        )}
      </View>

      {/* ── CONTENT — paddingBottom = navbarHeight + stats bar, comme edit.tsx ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: navbarHeight + 80 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {updatedAt && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 4 }}>
            <Clock size={12} color={textSec} />
            <Text style={{ fontSize: 12, color: textSec }}>Modifié le {updatedAt}</Text>
          </View>
        )}

        <TextInput
          placeholder="Titre de la note"
          value={title}
          onChangeText={v => { setTitle(v); setHasChanges(true); }}
          style={{
            fontSize: 28, fontWeight: "700", color: textPri,
            paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8,
            letterSpacing: -0.5, lineHeight: 36,
          }}
          placeholderTextColor={darkMode ? "#2A2A2A" : "#DDDDDD"}
          multiline
        />

        <View style={{ marginHorizontal: 24, marginVertical: 12, height: 1, backgroundColor: border }} />

        <TextInput
          placeholder="Commencez à écrire..."
          value={content}
          onChangeText={v => { setContent(v); setHasChanges(true); }}
          multiline
          textAlignVertical="top"
          style={[{ paddingHorizontal: 24, paddingTop: 4, minHeight: 300, lineHeight: format.fontSize * 1.65 }, contentStyle]}
          placeholderTextColor={darkMode ? "#2A2A2A" : "#DDDDDD"}
        />
      </ScrollView>

      {/* ── STATS BAR ── */}
      <View style={{
        flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 12,
        paddingHorizontal: 20, paddingVertical: 8,
        borderTopWidth: 1, borderTopColor: border,
        backgroundColor: surface,
      }}>
        <Text style={{ fontSize: 12, color: textSec }}>{wordCount} mot{wordCount !== 1 ? "s" : ""}</Text>
        <View style={{ width: 3, height: 3, borderRadius: 99, backgroundColor: textSec }} />
        <Text style={{ fontSize: 12, color: textSec }}>{charCount} caractère{charCount !== 1 ? "s" : ""}</Text>
      </View>

      {/* ── NAVBAR — positionnée comme dans edit.tsx ── */}
      <NavbarBottom active="home" />

      {/* Safe area bottom */}
      <View style={{ height: insets.bottom, backgroundColor: bg }} />

      {/* ── MODALS ── */}
      <DropdownModal visible={showFontSize} onClose={() => setShowFontSize(false)} title="Taille de police" darkMode={darkMode}>
        <FlatList
          data={FONT_SIZES}
          keyExtractor={item => String(item)}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => { setFormat(f => ({ ...f, fontSize: item })); setShowFontSize(false); }}
              style={{
                paddingVertical: 14, paddingHorizontal: 20,
                flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                borderBottomWidth: 1, borderBottomColor: darkMode ? "#1A1A1A" : "#F5F5F5",
              }}
            >
              <Text style={{ fontSize: item, color: darkMode ? "#F9FAFB" : "#111827" }}>{item}px</Text>
              {format.fontSize === item && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#6366F1" }} />}
            </TouchableOpacity>
          )}
        />
      </DropdownModal>

      <DropdownModal visible={showFontFamily} onClose={() => setShowFontFamily(false)} title="Type de police" darkMode={darkMode}>
        <FlatList
          data={FONT_FAMILIES}
          keyExtractor={item => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => { setFormat(f => ({ ...f, fontFamily: item.value })); setShowFontFamily(false); }}
              style={{
                paddingVertical: 14, paddingHorizontal: 20,
                flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                borderBottomWidth: 1, borderBottomColor: darkMode ? "#1A1A1A" : "#F5F5F5",
              }}
            >
              <Text style={{
                fontSize: 16,
                fontFamily: item.value === "System" ? undefined : item.value,
                color: darkMode ? "#F9FAFB" : "#111827",
                fontWeight: format.fontFamily === item.value ? "700" : "400",
              }}>{item.label}</Text>
              {format.fontFamily === item.value && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#6366F1" }} />}
            </TouchableOpacity>
          )}
        />
      </DropdownModal>

      <DropdownModal visible={showTextColor} onClose={() => setShowTextColor(false)} title="Couleur du texte" darkMode={darkMode}>
        <ColorGrid colors={TEXT_COLORS} selected={format.textColor} onSelect={c => { setFormat(f => ({ ...f, textColor: c })); setShowTextColor(false); }} />
      </DropdownModal>

      <DropdownModal visible={showBgColor} onClose={() => setShowBgColor(false)} title="Fond du texte" darkMode={darkMode}>
        <ColorGrid colors={BG_COLORS} selected={format.bgColor} onSelect={c => { setFormat(f => ({ ...f, bgColor: c })); setShowBgColor(false); }} />
      </DropdownModal>
    </View>
  );
}



