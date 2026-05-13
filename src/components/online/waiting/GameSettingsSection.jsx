import { useState, useEffect } from 'react';
import { loadWordLists, saveWordList, deleteWordList } from '../../../utils/customWordLists';
import WordListModal from '../../shared/WordListModal';
import ContributeThemeModal from '../../shared/ContributeThemeModal';
import ThemeSelector from '../../shared/ThemeSelector';

const GameSettingsSection = ({
  isHost,
  selectedThemes,
  onToggleTheme,
  contributedThemes = [],
  onContributeTheme,
}) => {
  const [themesExpanded, setThemesExpanded] = useState(false);
  const [customLists, setCustomLists] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [contributeModalOpen, setContributeModalOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);

  useEffect(() => {
    setCustomLists(loadWordLists());
  }, []);

  const handleSaveList = (name, words) => {
    saveWordList(name, words);
    setCustomLists(loadWordLists());
  };

  const handleDeleteList = (name) => {
    if (confirm(`¿Eliminar la lista "${name}"?`)) {
      deleteWordList(name);
      setCustomLists(loadWordLists());
      // Remove from selected if it was selected
      if (selectedThemes.includes(name)) {
        onToggleTheme(name);
      }
    }
  };

  const handleEditList = (name) => {
    setEditingList({ name, words: customLists[name] });
    setModalOpen(true);
  };

  const handleOpenCreateModal = (e) => {
    e.stopPropagation();
    if (isHost) {
      // Host: open WordListModal to create/manage personal lists
      setEditingList(null);
      setModalOpen(true);
    } else {
      // Non-host: open ContributeThemeModal to share themes
      setContributeModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingList(null);
  };

  const handleContributeThemes = (themes) => {
    if (onContributeTheme) {
      onContributeTheme(themes);
    }
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Themes Selection */}
      <ThemeSelector
        selectedThemes={selectedThemes}
        onToggleTheme={onToggleTheme}
        expanded={themesExpanded}
        setExpanded={setThemesExpanded}
        isHost={isHost}
        customLists={customLists}
        contributedThemes={contributedThemes}
        onOpenCreateModal={handleOpenCreateModal}
        onEditList={handleEditList}
        onDeleteList={handleDeleteList}
      />

      {/* Word List Modal - for host only */}
      <WordListModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveList}
        existingList={editingList}
      />

      {/* Contribute Theme Modal - for non-host players */}
      <ContributeThemeModal
        isOpen={contributeModalOpen}
        onClose={() => setContributeModalOpen(false)}
        onContribute={handleContributeThemes}
      />
    </div>
  );
};

export default GameSettingsSection;
