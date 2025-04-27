import React from 'react';

interface NoteProps {
  note: {
    originalText: string;
    summary: string;
    keyPoints: string[];
    simplifiedText: string;
  };
  onClear: () => void;
}

const Note: React.FC<NoteProps> = ({ note, onClear }) => {
  if (!note) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>📝</span> AI Analysis
        </h2>
        
      </div>
      
      <div className="space-y-6">
        {/* Summary Section */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
          <p className="text-gray-700">{note.summary}</p>
        </div>

        {/* Key Points Section */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Key Points</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {note.keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>

        {/* Simplified Text Section */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Simplified Version</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{note.simplifiedText}</p>
        </div>

        {/* Original Text Section */}
        {/* <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Original Text</h3>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">{note.originalText}</p>
        </div> */}
      </div>
    </div>
  );
};

export default Note;