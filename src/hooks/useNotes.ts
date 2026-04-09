import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Note } from '../types';

const OPEN_NOTE_IDS_KEY = 'md-editor-open-note-ids';
const NOTE_PREFIX = 'md-editor-note-';

// One-time cleanup: strip any legacy `images` field from previously stored notes
// so that data URLs from removed image feature don't linger in localStorage.
(() => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(NOTE_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && 'images' in parsed) {
        delete parsed.images;
        localStorage.setItem(key, JSON.stringify(parsed));
      }
    }
  } catch (err) {
    console.error('Failed to migrate legacy notes:', err);
  }
})();

const getNoteIdFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('noteId');
};

const loadOpenNoteIds = (): string[] => {
  try {
    const data = localStorage.getItem(OPEN_NOTE_IDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveOpenNoteIds = (ids: string[]) => {
  localStorage.setItem(OPEN_NOTE_IDS_KEY, JSON.stringify(ids));
};

const loadNoteContent = (noteId: string): Partial<Note> | null => {
  try {
    const data = localStorage.getItem(NOTE_PREFIX + noteId);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const saveNoteContent = (note: Note) => {
  try {
    localStorage.setItem(NOTE_PREFIX + note.id, JSON.stringify({
      content: note.content,
      title: note.title,
      updatedAt: note.updatedAt,
    }));
  } catch (err) {
    console.error('Failed to save note to localStorage:', err);
  }
};

const deleteNoteContent = (noteId: string) => {
  localStorage.removeItem(NOTE_PREFIX + noteId);
};

const createNote = (content?: string): Note => {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  return {
    id,
    title: 'Note',
    content: content || '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const useNotes = () => {
  const urlNoteId = useMemo(() => getNoteIdFromUrl(), []);
  const [openNoteIds, setOpenNoteIds] = useState<string[]>(() => loadOpenNoteIds());

  const [notes, setNotes] = useState<Note[]>(() => {
    if (urlNoteId) {
      const saved = loadNoteContent(urlNoteId);
      const note = createNote(saved?.content);
      note.id = urlNoteId;
      if (saved) {
        note.title = saved.title || 'Note';
        note.updatedAt = saved.updatedAt || Date.now();
      }
      return [note];
    }
    return [createNote()];
  });

  const activeNoteId = urlNoteId || (notes[0]?.id || '');

  useEffect(() => {
    const currentId = urlNoteId || activeNoteId;
    if (currentId && !openNoteIds.includes(currentId)) {
      const newOpenIds = [...openNoteIds, currentId];
      setOpenNoteIds(newOpenIds);
      saveOpenNoteIds(newOpenIds);
    }
  }, [urlNoteId, activeNoteId, openNoteIds]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentId = urlNoteId || activeNoteId;
      if (currentId) {
        const newOpenIds = openNoteIds.filter(id => id !== currentId);
        saveOpenNoteIds(newOpenIds);
        deleteNoteContent(currentId);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [urlNoteId, activeNoteId, openNoteIds]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  const createNewNote = useCallback(() => {
    const note = createNote();
    window.open(`?noteId=${note.id}`, '_blank', 'noopener,noreferrer');
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    const newOpenIds = openNoteIds.filter(noteId => noteId !== id);
    setOpenNoteIds(newOpenIds);
    saveOpenNoteIds(newOpenIds);
    deleteNoteContent(id);
  }, [openNoteIds]);

  const renameNote = useCallback((id: string, title: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, title, updatedAt: Date.now() };
          saveNoteContent(updated);
          return updated;
        }
        return n;
      })
    );
  }, []);

  const updateNoteContent = useCallback((id: string, content: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, content, updatedAt: Date.now() };
          saveNoteContent(updated);
          return updated;
        }
        return n;
      })
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
  };
};