import React, { useState } from 'react';

export interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardSectionProps {
  flashcards: Flashcard[] | null;
}

const FlashcardSection: React.FC<FlashcardSectionProps> = ({ flashcards }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="text-center text-gray-400 text-lg py-12">
        No flashcards available for this document.
      </div>
    );
  }

  const card = flashcards[index];

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Flashcards</h2>
      <div
        className={`w-full h-48 flex items-center justify-center rounded-2xl shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 cursor-pointer transition-transform duration-300 ${
          flipped ? 'rotate-y-180' : ''
        }`}
        style={{ perspective: 1000 }}
        onClick={() => setFlipped(f => !f)}
      >
        <div className="w-full h-full flex items-center justify-center text-center text-xl font-semibold text-gray-800 select-none">
          {flipped ? card.back : card.front}
        </div>
      </div>
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => { setIndex(i => Math.max(0, i - 1)); setFlipped(false); }}
          disabled={index === 0}
          className="px-4 py-2 bg-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-400 transition-all disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => { setIndex(i => Math.min(flashcards.length - 1, i + 1)); setFlipped(false); }}
          disabled={index === flashcards.length - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        Card {index + 1} of {flashcards.length}
      </div>
      <div className="mt-2 text-xs text-gray-400">Click the card to flip</div>
    </div>
  );
};

export default FlashcardSection; 