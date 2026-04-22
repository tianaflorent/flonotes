"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Switch,
  Animated,
  Image,
  PanResponder,
  StatusBar,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useNotes } from "@/context/NotesContext";
import { useThemeMode } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import NavbarBottom from "@/components/navigation/NavbarBottom";
import {
  SquarePen,
  Trash2,
  Star,
  Archive,
  Settings,
  Menu,
  LayoutGrid,
  Sun,
  Moon,
  Rows4,
  LogOut,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAVBAR_HEIGHT = 72;

export default function Home() {
  const { notes, addNote, archiveNotes, trashNotes, favoriteNotes } = useNotes();
  const { darkMode, toggleTheme } = useThemeMode();
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selected, setSelected] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

  // Bottom sheet (action sur une note)
  const [actionNote, setActionNote] = useState<string | null>(null);
  const sheetAnim = useRef(new Animated.Value(400)).current;

  const openSheet = (id: string) => {
    setActionNote(id);
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 180,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: 400,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setActionNote(null));
  };

  useEffect(() => {
    const loadViewType = async () => {
      const saved = await AsyncStorage.getItem("notesViewType");
      if (saved === "grid" || saved === "list") setViewType(saved);
    };
    loadViewType();
  }, []);

  const toggleViewType = async () => {
    const newType = viewType === "grid" ? "list" : "grid";
    setViewType(newType);
    await AsyncStorage.setItem("notesViewType", newType);
  };

  /* TOAST */
  const [toast, setToast] = useState({ visible: false, message: "" });
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(1600),
      Animated.timing(toastAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setToast({ visible: false, message: "" }));
  };

  /* DRAWER */
  const translateX = useRef(new Animated.Value(280)).current;

  const openMenu = () => {
    setShowMenu(true);
    Animated.timing(translateX, { toValue: 0, duration: 260, useNativeDriver: true }).start();
  };

  const closeMenu = () => {
    Animated.timing(translateX, { toValue: 280, duration: 210, useNativeDriver: true }).start(
      () => setShowMenu(false)
    );
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => g.dx > 10,
    onPanResponderMove: (_, g) => { if (g.dx > 0) translateX.setValue(g.dx); },
    onPanResponderRelease: (_, g) => { if (g.dx > 80) closeMenu(); else openMenu(); },
  });

  /* SELECTION */
  const toggleSelect = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]);
  const clearSelection = () => setSelected([]);
  const isSelectionMode = selected.length > 0;

  /* ACTIONS sélection multiple */
  const handleFavorite = () => {
    favoriteNotes(selected);
    showToast(`${selected.length} note(s) ajoutée(s) aux favoris`);
    clearSelection();
  };
  const handleArchive = () => {
    archiveNotes(selected);
    showToast(`${selected.length} note(s) archivée(s)`);
    clearSelection();
  };
  const handleTrash = () => {
    trashNotes(selected);
    showToast(`${selected.length} note(s) supprimée(s)`);
    clearSelection();
  };

  /* ACTIONS bottom sheet */
  const handleSheetFavorite = () => {
    if (!actionNote) return;
    favoriteNotes([actionNote]);
    showToast("Ajoutée aux favoris");
    closeSheet();
  };
  const handleSheetArchive = () => {
    if (!actionNote) return;
    archiveNotes([actionNote]);
    showToast("Note archivée");
    closeSheet();
  };
  const handleSheetTrash = () => {
    if (!actionNote) return;
    trashNotes([actionNote]);
    showToast("Note supprimée");
    closeSheet();
  };

  const bg = darkMode ? "#000000" : "#F3F4F6";
  const headerBg = darkMode ? "#000000" : "#FFFFFF";
  const cardBg = darkMode ? "#111827" : "#FFFFFF";
  const drawerBg = darkMode ? "#0F172A" : "#FFFFFF";
  const navbarHeight = NAVBAR_HEIGHT + insets.bottom;

  const filteredNotes = notes.filter(
    (n) =>
      !n.trashed &&
      (n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedNote = notes.find((n) => n.id === actionNote);

  return (
    <View style={{ flex: 1, backgroundColor: darkMode ? "#000000" : "#FFFFFF" }}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={darkMode ? "#000000" : "#FFFFFF"}
      />

      <View style={{ height: insets.top, backgroundColor: headerBg }} />

      <View style={{ flex: 1, backgroundColor: bg }}>

        {/* ─── HEADER ─── */}
        <View
          style={{
            backgroundColor: headerBg,
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 18,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: darkMode ? 0.35 : 0.06,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {/* Ligne titre + contrôles */}
          {isSelectionMode ? (
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <Text style={{ fontSize: 17, fontWeight: "600", color: darkMode ? "#F9FAFB" : "#111827" }}>
                {selected.length} sélectionnée(s)
              </Text>
              <TouchableOpacity onPress={clearSelection}>
                <Text style={{ color: "#6B7280", fontSize: 14 }}>Annuler</Text>
              </TouchableOpacity>
            </View>
            
          ) : (
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              
              <Text style={{ fontSize: 28, fontFamily: "DancingScript_700Bold", color: "#059669", letterSpacing: 1 }}>
                  FloNotes
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 25 }}>
                <TouchableOpacity onPress={toggleViewType}>
                  {viewType === "grid"
                    ? <LayoutGrid size={21} color={darkMode ? "#9CA3AF" : "#6B7280"} />
                    : <Rows4 size={21} color={darkMode ? "#9CA3AF" : "#6B7280"} />
                  }
                </TouchableOpacity>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Sun size={16} color={darkMode ? "#6B7280" : "#F59E0B"} />
                  <Switch
                    value={darkMode}
                    onValueChange={toggleTheme}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    trackColor={{ false: "#E5E7EB", true: "#059669" }}
                    thumbColor="#FFFFFF"
                  />
                  <Moon size={16} color={darkMode ? "#60A5FA" : "#9CA3AF"} />
                </View>
                <TouchableOpacity
                  onPress={openMenu}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 11,
                    backgroundColor: darkMode ? "#1F2937" : "#F3F4F6",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Menu size={18} color={darkMode ? "#E5E7EB" : "#374151"} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Barre de recherche ou barre d'actions */}

          {!isSelectionMode ? (
            <TextInput
              placeholder=" Rechercher une note..."
              value={search}
              onChangeText={setSearch}
              style={{
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: darkMode ? "#1F2937" : "#E5E7EB",
                backgroundColor: darkMode ? "#111827" : "#F9FAFB",
                color: darkMode ? "#F9FAFB" : "#374151",
                fontSize: 14,
              }}
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                backgroundColor: darkMode ? "#111827" : "#F9FAFB",
                borderRadius: 14,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: darkMode ? "#1F2937" : "#E5E7EB",
              }}
            >
              {[
                { label: "Favoris",  icon: <Star size={20} color="#EAB308" fill="#EAB308" />, onPress: handleFavorite, color: "#EAB308" },
                { label: "Archiver", icon: <Archive size={20} color="#3B82F6" />,             onPress: handleArchive,  color: "#3B82F6" },
                { label: "Supprimer",icon: <Trash2 size={20} color="#EF4444" />,              onPress: handleTrash,    color: "#EF4444" },
              ].map((a) => (
                <TouchableOpacity key={a.label} onPress={a.onPress} style={{ alignItems: "center", gap: 5 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: `${a.color}22`, alignItems: "center", justifyContent: "center" }}>
                    {a.icon}
                  </View>
                  <Text style={{ fontSize: 11, color: a.color, fontWeight: "600" }}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Espacement header → liste */}
        <View style={{ height: 14 }} />

        {/* ─── LISTE DES NOTES ─── */}
        <FlatList
          key={viewType}
          numColumns={viewType === "grid" ? 2 : 1}
          data={filteredNotes}
          keyExtractor={(note) => note.id}
          contentContainerStyle={{ paddingBottom: navbarHeight + 16, paddingHorizontal: 14 }}
          columnWrapperStyle={viewType === "grid" ? { gap: 12 } : undefined}
          // renderItem={({ item: note }) => {
          //   const isSelected = selected.includes(note.id);
          //   const dateObj = new Date(note.date);
          //   const formattedDate = dateObj.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
          //   const formattedTime = dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
          
          //   // ✅ Récupère le format sauvegardé
          //   const fmt = note.format;
          //   const contentStyle = fmt ? {
          //     fontWeight:          fmt.bold          ? ("700" as const) : ("400" as const),
          //     fontStyle:           fmt.italic        ? ("italic" as const) : ("normal" as const),
          //     textDecorationLine:
          //       fmt.underline && fmt.strikethrough   ? ("underline line-through" as any)
          //       : fmt.underline                      ? ("underline" as const)
          //       : fmt.strikethrough                  ? ("line-through" as const)
          //       : ("none" as const),
          //     fontSize:            fmt.fontSize      ?? 13,
          //     fontFamily:          fmt.fontFamily === "System" ? undefined : fmt.fontFamily,
          //     color:               fmt.textColor     ?? (darkMode ? "#9CA3AF" : "#6B7280"),
          //     backgroundColor:     fmt.bgColor === "transparent" ? undefined : fmt.bgColor,
          //   } : {
          //     color:    darkMode ? "#9CA3AF" : "#6B7280",
          //     fontSize: 13,
          //   };
          
          //   return (
          //     <TouchableOpacity
          //       onLongPress={() => toggleSelect(note.id)}
          //       onPress={() => {
          //         if (isSelectionMode) toggleSelect(note.id);
          //         else openSheet(note.id);
          //       }}
          //       activeOpacity={0.75}
          //       style={{
          //         flex: viewType === "grid" ? 1 : undefined,
          //         marginBottom: 12,
          //         borderRadius: 20,
          //         padding: 16,
          //         backgroundColor: isSelected
          //           ? (darkMode ? "#1E3A5F" : "#EFF6FF")
          //           : cardBg,
          //         borderWidth: 1,
          //         borderColor: isSelected ? "#3B82F6" : (darkMode ? "#1F2937" : "#F0F0F0"),
          //         shadowColor: "#000",
          //         shadowOffset: { width: 0, height: 2 },
          //         shadowOpacity: darkMode ? 0.25 : 0.05,
          //         shadowRadius: 6,
          //         elevation: 2,
          //       }}
          //     >
          //       {isSelected && (
          //         <View style={{
          //           position: "absolute", top: 12, right: 12,
          //           width: 20, height: 20, borderRadius: 10,
          //           backgroundColor: "#3B82F6",
          //           alignItems: "center", justifyContent: "center",
          //         }}>
          //           <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "700" }}>✓</Text>
          //         </View>
          //       )}
          
          //       {/* ✅ Titre — toujours lisible */}
          //       <Text
          //         style={{
          //           fontWeight: "700",
          //           fontSize: 15,
          //           marginBottom: 6,
          //           color: darkMode ? "#F9FAFB" : "#111827",
          //           paddingRight: isSelected ? 26 : 0,
          //         }}
          //         numberOfLines={1}
          //       >
          //         {note.title}
          //       </Text>
          
          //       {/* ✅ Contenu avec le format appliqué */}
          //       <Text
          //         numberOfLines={viewType === "grid" ? 3 : 4}
          //         style={[{ lineHeight: (contentStyle.fontSize ?? 13) * 1.6 }, contentStyle]}
          //       >
          //         {note.content}
          //       </Text>
          
          //       {/* ✅ Indicateur favoris */}
          //       {note.favorite && (
          //         <View style={{ position: "absolute", top: 12, right: isSelected ? 38 : 12 }}>
          //           <Star size={14} color="#EAB308" fill="#EAB308" />
          //         </View>
          //       )}
          
          //       <View style={{
          //         flexDirection: "row", alignItems: "center",
          //         marginTop: 12, paddingTop: 10,
          //         borderTopWidth: 1,
          //         borderTopColor: darkMode ? "#1F2937" : "#F3F4F6",
          //         gap: 4,
          //       }}>
          //         <Text style={{ fontSize: 11, color: darkMode ? "#9CA3AF" : "#000000" }}>{formattedDate}</Text>
          //         <Text style={{ fontSize: 11, color: darkMode ? "#374151" : "#E0E0E0" }}>•</Text>
          //         <Text style={{ fontSize: 11, color: darkMode ? "#9CA3AF" : "#000000" }}>{formattedTime}</Text>
          //       </View>
          //     </TouchableOpacity>
          //   );
          // }}
          renderItem={({ item: note }) => {
            const isSelected = selected.includes(note.id);
            const dateObj = new Date(note.date);
            const formattedDate = dateObj.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
            const formattedTime = dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
          
            const fmt = note.format;
          
            //  Couleurs considérées "sombres" → invisibles en dark mode
            const darkColors = ["#000000", "#000", "#111827", "#1F2937", "#0A0A0A", "#111111", "#1A1A1A", "#0D1136"];
            //  Couleurs considérées "claires" → invisibles en light mode  
            const lightColors = ["#FFFFFF", "#FFF", "#F9FAFB", "#F3F4F6", "#FAFAFA", "#EEF0FF"];
          
            const resolveTextColor = (color: string) => {
              if (!color || color === "transparent") return darkMode ? "#9CA3AF" : "#6B7280";
              if (darkMode && darkColors.some(c => color.toLowerCase() === c.toLowerCase()))
                return "#F9FAFB"; //  Remplace noir par blanc en dark mode
              if (!darkMode && lightColors.some(c => color.toLowerCase() === c.toLowerCase()))
                return "#111827"; //  Remplace blanc par noir en light mode
              return color;
            };
          
            const contentStyle = fmt ? {
              fontWeight:        fmt.bold          ? ("700" as const) : ("400" as const),
              fontStyle:         fmt.italic        ? ("italic" as const) : ("normal" as const),
              textDecorationLine:
                fmt.underline && fmt.strikethrough ? ("underline line-through" as any)
                : fmt.underline                    ? ("underline" as const)
                : fmt.strikethrough                ? ("line-through" as const)
                : ("none" as const),
              fontSize:          fmt.fontSize      ?? 13,
              fontFamily:        fmt.fontFamily === "System" ? undefined : fmt.fontFamily,
              color:             resolveTextColor(fmt.textColor),
              backgroundColor:   fmt.bgColor === "transparent" ? undefined : fmt.bgColor,
            } : {
              color:    darkMode ? "#9CA3AF" : "#374151",
              fontSize: 13,
            };
          
            return (
              <TouchableOpacity
                onLongPress={() => toggleSelect(note.id)}
                onPress={() => {
                  if (isSelectionMode) toggleSelect(note.id);
                  else openSheet(note.id);
                }}
                activeOpacity={0.75}
                style={{
                  flex: viewType === "grid" ? 1 : undefined,
                  marginBottom: 12,
                  borderRadius: 20,
                  padding: 16,
                  backgroundColor: isSelected
                    ? (darkMode ? "#1E3A5F" : "#EFF6FF")
                    : cardBg,
                  borderWidth: 1,
                  borderColor: isSelected ? "#3B82F6" : (darkMode ? "#1F2937" : "#F0F0F0"),
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: darkMode ? 0.25 : 0.05,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                {isSelected && (
                  <View style={{
                    position: "absolute", top: 12, right: 12,
                    width: 20, height: 20, borderRadius: 10,
                    backgroundColor: "#3B82F6",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "700" }}>✓</Text>
                  </View>
                )}
          
                {/*  Titre toujours lisible selon le mode */}
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 15,
                    marginBottom: 6,
                    color: darkMode ? "#F9FAFB" : "#111827",
                    paddingRight: isSelected ? 26 : 0,
                  }}
                  numberOfLines={1}
                >
                  {note.title}
                </Text>
          
                {/*  Contenu avec couleur adaptée au mode */}
                <Text
                  numberOfLines={viewType === "grid" ? 3 : 4}
                  style={[{ lineHeight: (contentStyle.fontSize ?? 13) * 1.6 }, contentStyle]}
                >
                  {note.content}
                </Text>
          
                {/* Indicateur favoris */}
                {note.favorite && (
                  <View style={{ position: "absolute", top: 12, right: isSelected ? 38 : 12 }}>
                    <Star size={14} color="#EAB308" fill="#EAB308" />
                  </View>
                )}
          
                <View style={{
                  flexDirection: "row", alignItems: "center",
                  marginTop: 12, paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: darkMode ? "#1F2937" : "#F3F4F6",
                  gap: 4,
                }}>
                  <Text style={{ fontSize: 11, color: darkMode ? "#6B7280" : "#9CA3AF" }}>{formattedDate}</Text>
                  <Text style={{ fontSize: 11, color: darkMode ? "#374151" : "#E0E0E0" }}>•</Text>
                  <Text style={{ fontSize: 11, color: darkMode ? "#6B7280" : "#9CA3AF" }}>{formattedTime}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />

        {/* ─── DRAWER ─── */}
        {showMenu && (
          <>
            {/* Overlay */}
            <TouchableWithoutFeedback onPress={closeMenu}>
              <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.30)" }} />
            </TouchableWithoutFeedback>

            {/* Panel — s'arrête au-dessus de la NavbarBottom */}
            <Animated.View
              {...panResponder.panHandlers}
              style={{
                transform: [{ translateX }],
                position: "absolute",
                top: 0,
                right: 0,
                bottom: navbarHeight,   // ← ne dépasse pas la navbar
                width: 260,
                backgroundColor: drawerBg,
                borderTopLeftRadius: 24,
                borderBottomLeftRadius: 24,
                paddingHorizontal: 22,
                paddingTop: 56,
                shadowColor: "#000",
                shadowOffset: { width: -4, height: 0 },
                shadowOpacity: 0.18,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              {/* Titre du drawer */}
              <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1.2, color: "#9CA3AF", textTransform: "uppercase", marginBottom: 20 }}>
                Navigation
              </Text>

              {/* Items sans background */}
              {[
                { label: "Archives",   icon: <Archive  size={20} color="#3B82F6" />, route: "/Archive"  },
                { label: "Corbeille",  icon: <Trash2   size={20} color="#EF4444" />, route: "/Trash"    },
                { label: "Paramètres", icon: <Settings size={20} color={darkMode ? "#9CA3AF" : "#6B7280"} />, route: "/settings" },
              ].map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => { closeMenu(); router.push(item.route as any); }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    borderBottomWidth: i < 2 ? 1 : 0,
                    borderBottomColor: darkMode ? "#1E293B" : "#F3F4F6",
                  }}
                >
                  <View style={{ width: 36, alignItems: "center" }}>{item.icon}</View>
                  <Text style={{ marginLeft: 12, fontSize: 15, fontWeight: "500", color: darkMode ? "#E5E7EB" : "#111827" }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Séparateur */}
              <View style={{ height: 1, backgroundColor: darkMode ? "#1E293B" : "#F3F4F6", marginVertical: 18 }} />

              {/* Bloc utilisateur */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: "#059669", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 17 }}>
                    {user?.name?.charAt(0).toUpperCase() ?? "U"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: darkMode ? "#F9FAFB" : "#111827", fontWeight: "600", fontSize: 14 }} numberOfLines={1}>
                    {user?.name}
                  </Text>
                  <Text style={{ color: "#9CA3AF", fontSize: 12 }} numberOfLines={1}>
                    {user?.email}
                  </Text>
                </View>
              </View>

              {/* Bouton déconnexion */}
              <TouchableOpacity
                onPress={() => { closeMenu(); logout(); }}
                style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4 }}
              >
                <LogOut size={17} color="#EF4444" />
                <Text style={{ marginLeft: 10, color: "#EF4444", fontWeight: "600", fontSize: 14 }}>
                  Déconnexion
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}

        {/* ─── BOTTOM SHEET ─── */}
        <Modal visible={actionNote !== null} transparent animationType="none" onRequestClose={closeSheet}>
          <TouchableWithoutFeedback onPress={closeSheet}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
              <TouchableWithoutFeedback>
                <Animated.View
                  style={{
                    transform: [{ translateY: sheetAnim }],
                    backgroundColor: drawerBg,
                    borderTopLeftRadius: 28,
                    borderTopRightRadius: 28,
                    paddingTop: 12,
                    paddingHorizontal: 20,
                    paddingBottom: insets.bottom + 24,
                  }}
                >
                  {/* Drag handle */}
                  <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: darkMode ? "#374151" : "#E5E7EB", alignSelf: "center", marginBottom: 18 }} />

                  {/* Titre + extrait */}
                  {selectedNote && (
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 16, fontWeight: "700", color: darkMode ? "#F9FAFB" : "#111827" }} numberOfLines={1}>
                        {selectedNote.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 3 }} numberOfLines={1}>
                        {selectedNote.content?.slice(0, 60)}{(selectedNote.content?.length ?? 0) > 60 ? "…" : ""}
                      </Text>
                    </View>
                  )}

                  <View style={{ height: 1, backgroundColor: darkMode ? "#1E293B" : "#F3F4F6", marginBottom: 14 }} />

                  {/* Actions */}
                  {[
                    { label: "Ouvrir la note",      sublabel: "Voir et modifier",          icon: <SquarePen size={22} color="#059669" />, iconBg: "rgba(5,150,105,0.12)",  textColor: darkMode ? "#F9FAFB" : "#111827", onPress: () => { closeSheet(); setTimeout(() => router.push(`/note/${actionNote}`), 240); } },
                    { label: "Ajouter aux favoris", sublabel: "Épingler cette note",        icon: <Star size={22} color="#EAB308" fill="#EAB308" />, iconBg: "rgba(234,179,8,0.12)", textColor: darkMode ? "#F9FAFB" : "#111827", onPress: handleSheetFavorite },
                    { label: "Archiver",            sublabel: "Déplacer dans les archives", icon: <Archive size={22} color="#3B82F6" />,  iconBg: "rgba(59,130,246,0.12)", textColor: darkMode ? "#F9FAFB" : "#111827", onPress: handleSheetArchive },
                    { label: "Supprimer",           sublabel: "Déplacer dans la corbeille", icon: <Trash2 size={22} color="#EF4444" />,   iconBg: "rgba(239,68,68,0.12)",  textColor: "#EF4444",                         onPress: handleSheetTrash },
                  ].map((action, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={action.onPress}
                      activeOpacity={0.7}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 13,
                        paddingHorizontal: 14,
                        borderRadius: 16,
                        backgroundColor: darkMode ? "#0F172A" : "#FAFAFA",
                        marginBottom: 9,
                        borderWidth: 1,
                        borderColor: darkMode ? "#1E293B" : "#F3F4F6",
                      }}
                    >
                      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: action.iconBg, alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                        {action.icon}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: "600", color: action.textColor }}>{action.label}</Text>
                        <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>{action.sublabel}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}

                  {/* Annuler */}
                  <TouchableOpacity
                    onPress={closeSheet}
                    style={{ alignItems: "center", paddingVertical: 14, borderRadius: 16, backgroundColor: darkMode ? "#1E293B" : "#F3F4F6", marginTop: 2 }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: "600", color: darkMode ? "#9CA3AF" : "#6B7280" }}>Annuler</Text>
                  </TouchableOpacity>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* ─── TOAST ─── */}
        {toast.visible && (
          <Animated.View
            style={{
              position: "absolute",
              bottom: navbarHeight + 12,
              alignSelf: "center",
              backgroundColor: darkMode ? "#1F2937" : "#111827",
              paddingHorizontal: 20,
              paddingVertical: 11,
              borderRadius: 20,
              opacity: toastAnim,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "500" }}>{toast.message}</Text>
          </Animated.View>
        )}

        <NavbarBottom active="home" />
      </View>

      <View style={{ height: insets.bottom, backgroundColor: darkMode ? "#FFFFFF" : "#F3F4F6" }} />
    </View>
  );
}