import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Note } from '../types';

const NOTES_KEY = 'md-editor-notes';

const loadNotes = (): Note[] => {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

const saveNotes = (notes: Note[]) => {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};

const getNoteIdFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('noteId');
};

const createNote = (): Note => ({
  id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
  title: 'Заметка',
  content: '',
  images: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const useNotes = () => {
  const urlNoteId = useMemo(() => getNoteIdFromUrl(), []);

  const [notes, setNotes] = useState<Note[]>(() => {
    const all = loadNotes();
    if (urlNoteId && !all.find((n) => n.id === urlNoteId)) {
      const note = createNote();
      note.id = urlNoteId;
      return [note, ...all];
    }
    return all;
  });

  const activeNoteId = urlNoteId || (notes[0]?.id || '');
  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const createNewNote = useCallback(() => {
    const note = createNote();
    setNotes((prev) => [note, ...prev]);
    window.open(`?noteId=${note.id}`, '_blank');
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const renameNote = useCallback((id: string, title: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, title, updatedAt: Date.now() } : n))
    );
  }, []);

  const updateNoteContent = useCallback((id: string, content: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, content, updatedAt: Date.now() } : n))
    );
  }, []);

  const updateNoteImages = useCallback((id: string, images: [string, string][]) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, images, updatedAt: Date.now() } : n))
    );
  }, []);

  return {
    notes,
    activeNote,
    activeNoteId,
    createNewNote,
    deleteNote,
    renameNote,
    updateNoteContent,
    updateNoteImages,
  };
};
