"use client";

import React from "react";
import { View, TouchableOpacity, StyleSheet, Text, Platform } from "react-native";
import { useRouter } from "expo-router";
import {
  School,
  Search,
  SquarePen,
  Star,
  Plus,
} from "lucide-react-native";

interface Props {
  active?: string;
}

export default function NavbarBottom({ active = "home" }: Props) {
  const router = useRouter();
  const iconSize = 24;

  const tabs = [
    { key: "home", icon: School, label: "Accueil", route: "/" },
    { key: "favorites", icon: Star, label: "Favoris", route: "/favorites" },
    { key: "search", icon: Search, label: "Recherche", route: "/search" },
    { key: "edit", icon: SquarePen, label: "Éditer", route: "/edit" },
  ];

  return (
    <View style={styles.wrapper}>
      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          onPress={() => router.push("/edit")}
          activeOpacity={0.85}
          style={styles.fab}
          
        >
          <Plus size={26} color="white" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.navbar}>
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          const Icon = tab.icon;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => router.push(tab.route as any)}
              activeOpacity={0.7}
              style={styles.tabButton}
            >
              <Icon
                size={isActive ? 26 : iconSize}
                strokeWidth={isActive ? 2.5 : 1.6}
                color={isActive ? "#111827" : "#6B7280"}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 50,
    left: 16,
    right: 16,
  },
  fabContainer: {
    position: "absolute",
    bottom: 150,      
    right: 0,        
    zIndex: 10,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 14,
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F44336",
    alignItems: "center",
    justifyContent: "center",
  },
  navbar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    height: 72,
    alignItems: "center",
    paddingHorizontal: 6,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: "#6B7280",
    letterSpacing: 0.3,
  },
  labelActive: {
    color: "#111827",
    fontWeight: "700",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#111827",
  },
});