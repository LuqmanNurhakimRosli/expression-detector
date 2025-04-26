import React, { useState } from 'react';
import Note from './Note';
import QuizSection, { QuizQuestion } from './QuizSection';
import FlashcardSection, { Flashcard } from './FlashcardSection';

interface ResultSectionProps {
  inputType: 'audio' | 'pdf' | null;
  transcription: string;
  note: {
    originalText: string;
    summary: string;
    keyPoints: string[];
    simplifiedText: string;
  } | null;
  onReset: () => void;
  quiz: QuizQuestion[] | null;
  flashcards: Flashcard[] | null;
}

const TABS = [
  { key: 'note', label: 'Notes' },
  { key: 'quiz', label: 'Quizzes' },
  { key: 'flashcard', label: 'Flashcards' },
];

const ResultSection: React.FC<ResultSectionProps> = ({ inputType, transcription, note, onReset, quiz, flashcards }) => {
  const [activeTab, setActiveTab] = useState('note');
  const hasResult = !!(transcription || note);

  return (
    <div className="bg-white rounded-3xl shadow-md p-8 mt-8 w-full">
      {/* NavLink Tabs */}
      {hasResult && (
        <div className="flex justify-center mb-8">
          <nav className="flex gap-4 rounded-lg bg-gray-100 p-2">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none ${
                  activeTab === tab.key
                    ? 'bg-blue-500 text-white shadow'
                    : 'bg-white text-gray-700 hover:bg-blue-100'
                }`}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      )}
      {/* Audio: Show transcription first, then note */}
      {inputType === 'audio' && transcription && activeTab === 'note' && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Transcription</h2>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap text-gray-700 max-h-64 overflow-y-auto">
            {transcription}
          </div>
        </div>
      )}
      {/* Show note for both audio and PDF */}
      {note && activeTab === 'note' && <Note note={note} onClear={onReset} />}
      {/* Quiz Section */}
      {activeTab === 'quiz' && <QuizSection quiz={quiz} />}
      {/* Flashcard Section */}
      {activeTab === 'flashcard' && <FlashcardSection flashcards={flashcards} />}
      {/* Reset Button */}
      {hasResult && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onReset}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all shadow-md flex items-center gap-2"
          >
            <span>🔄</span> Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultSection; 