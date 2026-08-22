import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../config/api';

const VaultContext = createContext();

export const VaultProvider = ({ children }) => {
  const [currentCardId, setCurrentCardId] = useState(null);
  const [publicSibling, setPublicSibling] = useState(null);
  const [unlockedSibling, setUnlockedSibling] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [activeRecording, setActiveRecording] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);
  const [isLoadingPrivate, setIsLoadingPrivate] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  // Initialize sibling public info
  const loadPublicVault = useCallback(async (cardId) => {
    if (!cardId) return;
    setCurrentCardId(cardId.toUpperCase());
    setIsLoadingPublic(true);
    setError(null);

    try {
      const res = await API.get(`/public/siblings/${cardId}`);
      if (res.data.success) {
        setPublicSibling(res.data.sibling);

        // Check if we have an active vault session for this card
        const savedToken = sessionStorage.getItem(`vault_token_${cardId.toUpperCase()}`);
        if (savedToken) {
          sessionStorage.setItem('vault_access_token', savedToken);
          await loadPrivateVault(savedToken);
        }
      }
    } catch (err) {
      console.error('Failed to load public card:', err);
      setError(err.response?.data?.message || 'Memory vault not found.');
    } finally {
      setIsLoadingPublic(false);
    }
  }, []);

  // Fetch private recordings after unlock
  const loadPrivateVault = async (token) => {
    setIsLoadingPrivate(true);
    try {
      const res = await API.get('/access/vault', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setUnlockedSibling(res.data.sibling);
        const fetchedRecordings = res.data.recordings || [];
        setRecordings(fetchedRecordings);
        setIsUnlocked(true);

        // If exactly 1 recording, automatically set as active
        if (fetchedRecordings.length === 1) {
          setActiveRecording(fetchedRecordings[0]);
        } else if (fetchedRecordings.length > 1 && !activeRecording) {
          // Keep activeRecording null until user clicks one in the library
          setActiveRecording(null);
        }
      }
    } catch (err) {
      console.error('Failed to load unlocked vault:', err);
      lockVault();
    } finally {
      setIsLoadingPrivate(false);
    }
  };

  // Verify 6-digit PIN
  const unlockWithCode = async (code) => {
    if (!currentCardId) throw new Error('Card ID is missing.');
    setError(null);

    try {
      const res = await API.post('/access/verify', {
        cardId: currentCardId,
        code,
      });

      if (res.data.success) {
        const { vaultToken, sibling } = res.data;
        sessionStorage.setItem(`vault_token_${currentCardId}`, vaultToken);
        sessionStorage.setItem('vault_access_token', vaultToken);
        setUnlockedSibling(sibling);

        // Now load private recordings
        await loadPrivateVault(vaultToken);
        return res.data;
      }
    } catch (err) {
      const msg = err.response?.data?.message || "That doesn't seem to be the right key. Try again. ♡";
      setError(msg);
      throw new Error(msg);
    }
  };

  // Lock Vault
  const lockVault = () => {
    if (currentCardId) {
      sessionStorage.removeItem(`vault_token_${currentCardId}`);
    }
    sessionStorage.removeItem('vault_access_token');
    setIsUnlocked(false);
    setUnlockedSibling(null);
    setRecordings([]);
    setActiveRecording(null);
    setIsPlaying(false);
  };

  const selectRecording = (rec) => {
    setActiveRecording(rec);
    setIsPlaying(false); // Mobile safety: let user initiate play
  };

  const nextSong = () => {
    if (!activeRecording || recordings.length <= 1) return;
    const currentIndex = recordings.findIndex((r) => r._id === activeRecording._id);
    const nextIndex = (currentIndex + 1) % recordings.length;
    setActiveRecording(recordings[nextIndex]);
    setIsPlaying(true);
  };

  const prevSong = () => {
    if (!activeRecording || recordings.length <= 1) return;
    const currentIndex = recordings.findIndex((r) => r._id === activeRecording._id);
    const prevIndex = (currentIndex - 1 + recordings.length) % recordings.length;
    setActiveRecording(recordings[prevIndex]);
    setIsPlaying(true);
  };

  return (
    <VaultContext.Provider
      value={{
        currentCardId,
        publicSibling,
        unlockedSibling,
        recordings,
        activeRecording,
        isUnlocked,
        isLoadingPublic,
        isLoadingPrivate,
        isPlaying,
        setIsPlaying,
        error,
        setError,
        loadPublicVault,
        unlockWithCode,
        lockVault,
        selectRecording,
        nextSong,
        prevSong,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => useContext(VaultContext);
