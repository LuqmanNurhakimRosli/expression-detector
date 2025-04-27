import React, { useState, useRef } from 'react';
import './App.css';
import { uploadAudio, transcribeAudio } from './services/transcription';
import { analyzeText, generateQuizFromText, generateFlashcardsFromText } from './services/aiAnalysis';
import { extractTextFromPDF } from './services/pdfUtils';
import AudioSection from './components/AudioSection';
import PdfSection from './components/PdfSection';
import ResultSection from './components/ResultSection';
import { QuizQuestion } from './components/QuizSection';
import { Flashcard } from './components/FlashcardSection';

const Features = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [inputType, setInputType] = useState<'audio' | 'pdf' | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [note, setNote] = useState<{
    originalText: string;
    summary: string;
    keyPoints: string[];
    simplifiedText: string;
  } | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Audio handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        setAudioFile(file);
        setInputType('audio');
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // File upload handlers
  const handleAudioFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
    setPdfFile(null);
    setInputType('audio');
    setTranscription('');
    setNote(null);
  };

  const handlePdfFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPdfFile(file);
    setAudioFile(null);
    setInputType('pdf');
    setTranscription('');
    setNote(null);
  };

  // Main analyze handler
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setTranscription('');
    setNote(null);
    setQuiz(null);
    setFlashcards(null);
    try {
      let text = '';
      if (inputType === 'audio' && audioFile) {
        const uploadUrl = await uploadAudio(audioFile);
        text = await transcribeAudio(uploadUrl);
        setTranscription(text);
        try {
          const analysis = await analyzeText(text);
          setNote({ originalText: text, ...analysis });
        } catch (error) {
          console.error('Error analyzing text:', error);
          alert(error instanceof Error ? error.message : 'Failed to analyze text. The transcription is still available.');
        }
      } else if (inputType === 'pdf' && pdfFile) {
        text = await extractTextFromPDF(pdfFile);
        try {
          const analysis = await analyzeText(text);
          setNote({ originalText: text, ...analysis });
        } catch (error) {
          console.error('Error analyzing text:', error);
          alert(error instanceof Error ? error.message : 'Failed to analyze text from PDF.');
        }
      }
      // Generate quiz and flashcards for both audio and pdf
      if (text) {
        try {
          const quizData = await generateQuizFromText(text);
          setQuiz(quizData);
        } catch (error) {
          setQuiz(null);
          alert(error instanceof Error ? error.message : 'Failed to generate quiz.');
        }
        try {
          const flashcardData = await generateFlashcardsFromText(text);
          setFlashcards(flashcardData);
        } catch (error) {
          setFlashcards(null);
          alert(error instanceof Error ? error.message : 'Failed to generate flashcards.');
        }
      }
    } catch (error) {
      console.error('Error during analysis:', error);
      setTranscription('Error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setAudioFile(null);
    setPdfFile(null);
    setInputType(null);
    setTranscription('');
    setIsAnalyzing(false);
    setNote(null);
    setQuiz(null);
    setFlashcards(null);
    chunksRef.current = [];
  };

  // Layout: two sections side by side, result below
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Speech or PDF Analyzer
        </h1>
        <div className="flex flex-col md:flex-row gap-8 justify-center mb-8">
          <AudioSection
            isRecording={isRecording}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onFileUpload={handleAudioFileUpload}
            audioFile={audioFile}
          />
          <PdfSection
            onFileUpload={handlePdfFileUpload}
            pdfFile={pdfFile}
          />
        </div>
        <div className="flex justify-center mb-8">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!audioFile && !pdfFile)}
            className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2 text-lg"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : '✨ Analyze'}
          </button>
        </div>
        <ResultSection
          inputType={inputType}
          transcription={transcription}
          note={note}
          onReset={handleReset}
          quiz={quiz}
          flashcards={flashcards}
        />
      </div>
    </div>
  );
};

export default Features;