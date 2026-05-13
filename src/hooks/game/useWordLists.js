import { useState, useEffect, useCallback } from 'react';
import { loadWordLists, saveWordList, deleteWordList } from '../../utils/customWordLists';

export const useWordLists = (selectedThemes, toggleTheme) => {
  const [customLists, setCustomLists] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);

  useEffect(() => {
    setCustomLists(loadWordLists());
  }, []);

  const handleSaveList = useCallback((name, words) => {
    saveWordList(name, words);
    setCustomLists(loadWordLists());
  }, []);

  const handleDeleteList = useCallback((name) => {
    if (confirm(`¿Eliminar la lista "${name}"?`)) {
      deleteWordList(name);
      setCustomLists(loadWordLists());
      if (selectedThemes.includes(name)) {
        toggleTheme(name);
      }
    }
  }, [selectedThemes, toggleTheme]);

  const handleEditList = useCallback((name) => {
    setEditingList({ name, words: customLists[name] });
    setModalOpen(true);
  }, [customLists]);

  const handleOpenCreateModal = useCallback((e) => {
    e.stopPropagation();
    setEditingList(null);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingList(null);
  }, []);

  return {
    customLists,
    modalOpen,
    editingList,
    handleSaveList,
    handleDeleteList,
    handleEditList,
    handleOpenCreateModal,
    handleCloseModal
  };
};
