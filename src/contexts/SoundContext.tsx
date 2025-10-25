// src/contexts/SoundContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SoundContextType {
  playAmbientSound: () => void;
  stopAmbientSound: () => void;
  toggleAmbientSound: () => void;
  isPlaying: boolean;
}

const SoundContext = createContext<SoundContextType>({} as SoundContextType);

export const useSound = () => useContext(SoundContext);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Spotify preview URL (loopable ambient music)
  const spotifyPreviewUrl = 'https://p.scdn.co/mp3-preview/ef2e0c72bb424ec1?cid=YOUR_SPOTIFY_CLIENT_ID';

  useEffect(() => {
    const audioElement = new Audio(spotifyPreviewUrl);
    audioElement.loop = true;
    audioElement.volume = 0.3;
    setAudio(audioElement);

    // Try autoplay (will fallback to user click)
    audioElement.play().then(() => setIsPlaying(true)).catch(() => {
      const playOnClick = () => {
        audioElement.play();
        setIsPlaying(true);
        document.removeEventListener('click', playOnClick);
      };
      document.addEventListener('click', playOnClick);
    });

    return () => {
      audioElement.pause();
    };
  }, []);

  const playAmbientSound = () => {
    if (audio) {
      audio.play();
      setIsPlaying(true);
    }
  };

  const stopAmbientSound = () => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const toggleAmbientSound = () => {
    isPlaying ? stopAmbientSound() : playAmbientSound();
  };

  return (
    <SoundContext.Provider value={{ playAmbientSound, stopAmbientSound, toggleAmbientSound, isPlaying }}>
      {children}
    </SoundContext.Provider>
  );
};
