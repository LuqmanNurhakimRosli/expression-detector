import React, { useState } from 'react';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface QuizSectionProps {
  quiz: QuizQuestion[] | null;
}

const QuizSection: React.FC<QuizSectionProps> = ({ quiz }) => {
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(quiz ? Array(quiz.length).fill(null) : []);
  const [showResults, setShowResults] = useState(false);

  if (!quiz) {
    return (
      <div className="text-center text-gray-400 text-lg py-12">
        No quiz available for this document.
      </div>
    );
  }

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (showResults) return;
    setUserAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = optIdx;
      return next;
    });
  };

  const handleSubmit = () => setShowResults(true);
  const handleRetry = () => {
    setUserAnswers(Array(quiz.length).fill(null));
    setShowResults(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Quiz</h2>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-8"
      >
        {quiz.map((q, qIdx) => (
          <div key={qIdx} className="bg-gray-50 rounded-xl p-6 shadow border border-gray-200">
            <div className="mb-4 font-semibold text-lg">{qIdx + 1}. {q.question}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {q.options.map((opt, optIdx) => {
                const isSelected = userAnswers[qIdx] === optIdx;
                const isCorrect = showResults && optIdx === q.correctIndex;
                const isWrong = showResults && isSelected && optIdx !== q.correctIndex;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={showResults}
                    onClick={() => handleSelect(qIdx, optIdx)}
                    className={`px-4 py-2 rounded-lg border transition-colors duration-200 text-left
                      ${isSelected ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-white'}
                      ${isCorrect ? 'border-green-500 bg-green-100' : ''}
                      ${isWrong ? 'border-red-500 bg-red-100' : ''}
                      ${showResults ? 'cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {showResults && (
              <div className="mt-3 text-sm">
                {userAnswers[qIdx] === q.correctIndex ? (
                  <span className="text-green-600 font-semibold">Correct!</span>
                ) : (
                  <span className="text-red-600 font-semibold">Wrong. Correct answer: {q.options[q.correctIndex]}</span>
                )}
              </div>
            )}
          </div>
        ))}
        <div className="flex justify-center gap-4 mt-8">
          {!showResults ? (
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all"
              disabled={userAnswers.some(a => a === null)}
            >
              Submit Quiz
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRetry}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
            >
              Retry Quiz
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default QuizSection; 