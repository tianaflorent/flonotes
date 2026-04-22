"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "@/lib/api";

export type NoteFormat = {
  bold:          boolean;
  italic:        boolean;
  underline:     boolean;
  strikethrough: boolean;
  fontSize:      number;
  fontFamily:    string;
  textColor:     string;
  bgColor:       string;
};

export type Note = {
  id:        string;
  title:     string;
  content:   string;
  format:    NoteFormat | null;
  trashed:   boolean;
  archived:  boolean;
  favorite:  boolean;
  date:      string;
  updatedAt: string | number | Date;
};

type NotesContextType = {
  notes:         Note[];
  loading:       boolean;
  addNote:       (title: string, content: string, format?: NoteFormat) => Promise<void>;
  updateNote:    (id: string, title: string, content: string, format?: NoteFormat) => Promise<void>;
  trashNotes:    (ids: string[]) => Promise<void>;
  archiveNotes:  (ids: string[]) => Promise<void>;
  favoriteNotes: (ids: string[]) => Promise<void>;
  refreshNotes:  () => Promise<void>;
  clearNotes:    () => void;
};

const NotesContext = createContext<NotesContextType | null>(null);

const parseFormat = (raw: any): NoteFormat | null => {
  if (!raw) return null;
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
};

const fromDB = (n: any): Note => ({
  id:        String(n.id),
  title:     n.title    ?? "Sans titre",
  content:   n.content  ?? "",
  format:    parseFormat(n.format),
  trashed:   n.trashed  === 1 || n.trashed  === true,
  archived:  n.archived === 1 || n.archived === true,
  favorite:  n.favorite === 1 || n.favorite === true,
  date:      n.created_at ?? new Date().toISOString(),
  updatedAt: n.updated_at ?? new Date().toISOString(),
});

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes,   setNotes]   = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshNotes = async () => {
    try {
      setLoading(true);
      const data = await api.get("/notes");
      if (data.notes) setNotes(data.notes.map(fromDB));
      else setNotes([]);
    } catch (e) {
      console.log("Erreur chargement notes:", e);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const clearNotes = () => {
    setNotes([]);
    setLoading(false);
  };

  useEffect(() => { refreshNotes(); }, []);

  const addNote = async (title: string, content: string, format?: NoteFormat) => {
    try {
      const data = await api.post("/notes", { title, content, format }, true);
      if (data.note) setNotes((prev) => [fromDB(data.note), ...prev]);
    } catch (e) {
      console.log("Erreur ajout note:", e);
    }
  };

  const updateNote = async (id: string, title: string, content: string, format?: NoteFormat) => {
    try {
      const data = await api.put(`/notes/${id}`, { title, content, format });
      if (data.note) {
        setNotes((prev) => prev.map((n) => n.id === id ? fromDB(data.note) : n));
      }
    } catch (e) {
      console.log("Erreur mise à jour note:", e);
    }
  };

  const trashNotes = async (ids: string[]) => {
    setNotes((prev) =>
      prev.map((n) => ids.includes(n.id) ? { ...n, trashed: true } : n)
    );
    await Promise.all(ids.map((id) => api.put(`/notes/${id}`, { trashed: true })));
  };

  const archiveNotes = async (ids: string[]) => {
    setNotes((prev) =>
      prev.map((n) => ids.includes(n.id) ? { ...n, archived: true } : n)
    );
    await Promise.all(ids.map((id) => api.put(`/notes/${id}`, { archived: true })));
  };

  const favoriteNotes = async (ids: string[]) => {
    const updatedNotes = notes.map((n) =>
      ids.includes(n.id) ? { ...n, favorite: !n.favorite } : n
    );
    setNotes(updatedNotes);
    await Promise.all(
      ids.map((id) => {
        const note = updatedNotes.find((n) => n.id === id);
        return api.put(`/notes/${id}`, { favorite: note?.favorite ?? false });
      })
    );
  };

  return (
    <NotesContext.Provider value={{
      notes, loading,
      addNote, updateNote,
      trashNotes, archiveNotes, favoriteNotes,
      refreshNotes, clearNotes,
    }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes doit être utilisé dans NotesProvider");
  return context;
}



