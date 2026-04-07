import { useState, useCallback, useMemo } from 'react';
import type { Note } from '../types';

const getNoteIdFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('noteId');
};

const createNote = (): Note => ({
  id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
  title: 'Note',
  content: '',
  images: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const useNotes = () => {
  const urlNoteId = useMemo(() => getNoteIdFromUrl(), []);

  const [notes, setNotes] = useState<Note[]>(() => {
    if (urlNoteId) {
      const note = createNote();
      note.id = urlNoteId;
      return [note];
    }
    const note = createNote();
    return [note];
  });

  const activeNoteId = urlNoteId || (notes[0]?.id || '');
  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

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
