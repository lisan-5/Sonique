import React from 'react';

interface MoodGalaxyProps {
  onMoodSelect: (mood: string) => void;
}

const moods = [
  "Rainy afternoon in a cozy coffee shop",
  "Late-night drive through city lights",
  "80s synth-pop video game nostalgia",
  "Upbeat indie music for a sunny day",
  "Epic fantasy movie soundtrack",
  "Chill lo-fi beats for studying",
  "Aggressive workout hype music",
  "A villain's triumphant monologue",
];

export const MoodGalaxy: React.FC<MoodGalaxyProps> = ({ onMoodSelect }) => {
  return (
    <div className="text-center py-10">
      <h2 className="text-2xl font-semibold text-gray-300 mb-6">Or get inspired by a mood...</h2>
      <div className="flex flex-wrap justify-center gap-3">
        {moods.map((mood) => (
          <button
            key={mood}
            onClick={() => onMoodSelect(mood)}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-full border border-gray-700 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-300"
          >
            {mood}
          </button>
        ))}
      </div>
    </div>
  );
};
