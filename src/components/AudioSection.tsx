import React from 'react';

interface AudioSectionProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  audioFile: File | null;
}

const AudioSection: React.FC<AudioSectionProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  onFileUpload,
  audioFile,
}) => (
  <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-6 w-full max-w-xs mx-auto">
    <h2 className="text-lg font-semibold mb-4">Audio Section</h2>
    <button
      onClick={isRecording ? onStopRecording : onStartRecording}
      className={`w-full px-6 py-4 rounded-lg font-medium text-white text-lg transition-all ${
        isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'
      } shadow-md mb-4`}
    >
      {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
    </button>
    <input
      type="file"
      accept="audio/*"
      onChange={onFileUpload}
      id="audio-upload"
      className="hidden"
    />
    <label
      htmlFor="audio-upload"
      className="block w-full text-center py-3 px-6 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600 mb-2"
    >
      📁 Upload Audio File
    </label>
    {audioFile && (
      <span className="text-xs text-gray-500 mt-2">Selected: {audioFile.name}</span>
    )}
  </div>
);

export default AudioSection; 