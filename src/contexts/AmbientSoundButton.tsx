import React from "react";
import { useSound } from "../contexts/SoundContext";
import { Volume2, VolumeX } from "lucide-react";

const AmbientSoundButton: React.FC = () => {
  const { isPlaying, playAmbientSound, stopAmbientSound } = useSound();

  const toggleSound = () => {
    if (isPlaying) {
      stopAmbientSound();
    } else {
      playAmbientSound();
    }
  };

  return (
    <button
      onClick={toggleSound}
      className="fixed bottom-4 right-4 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition"
      title={isPlaying ? "Mute ambient sound" : "Play ambient sound"}
    >
      {isPlaying ? <Volume2 size={22} /> : <VolumeX size={22} />}
    </button>
  );
};

export default AmbientSoundButton;
