import React, { useState, useRef, createContext, useEffect } from 'react';
import { Outlet, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import AudioSection from '../components/AudioSection';
import PdfSection from '../components/PdfSection';
import HistorySidebar from '../components/HistorySidebar';
import { uploadAudio, transcribeAudio } from '../services/transcription';
import { analyzeText, generateQuizFromText, generateFlashcardsFromText } from '../services/aiAnalysis';
import { extractTextFromPDF } from '../services/pdfUtils';
import { QuizQuestion } from '../components/QuizSection';
import { Flashcard } from '../components/FlashcardSection';
import { saveAnalysis, getAnalysis, updateAnalysis, getAnalysisHistory, AnalysisHistory, deleteAnalysis } from '../services/database';
import { useAuth } from '../context/AuthContext';
import { FaMicrophone, FaFilePdf, FaStickyNote, FaBrain, FaRegClone, FaMagic, FaSmile } from 'react-icons/fa';

// Fix react-icons typing for all icons used as JSX components
const FaMicrophoneIcon = FaMicrophone as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FaFilePdfIcon = FaFilePdf as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FaStickyNoteIcon = FaStickyNote as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FaBrainIcon = FaBrain as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FaRegCloneIcon = FaRegClone as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FaMagicIcon = FaMagic as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const FaSmileIcon = FaSmile as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

interface AnalysisData extends Omit<AnalysisHistory, 'id' | 'createdAt'> {
  userId: string;
}

interface FeaturesContextType {
  note: any;
  quiz: QuizQuestion[] | null;
  flashcards: Flashcard[] | null;
  transcription: string;
  handleReset: () => void;
  currentAnalysis: AnalysisHistory | null;
}

export const FeaturesContext = createContext<FeaturesContextType>({
  note: null,
  quiz: null,
  flashcards: null,
  transcription: '',
  handleReset: () => {},
  currentAnalysis: null,
});

// Helper to generate a friendly summary from a file name (simulate Gemini/AI)
function summarizeFileName(fileName: string | undefined): string {
  if (!fileName) return 'File';
  // Remove extension and replace underscores/dashes with spaces, capitalize words
  const name = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const Features = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [inputType, setInputType] = useState<'audio' | 'pdf' | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [note, setNote] = useState<any>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisHistory | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const location = useLocation();
  const [saved, setSaved] = useState(false);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

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
    }
    setIsRecording(false);
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

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  useEffect(() => {
    if (id) {
      loadAnalysis(id);
    }
  }, [id]);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const historyData = await getAnalysisHistory(user.uid);
      setHistory(historyData);
      console.log('Loaded history:', historyData);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const loadAnalysis = async (analysisId: string) => {
    try {
      const analysis = await getAnalysis(analysisId);
      if (analysis) {
        setCurrentAnalysis(analysis);
        setTranscription(analysis.transcription || '');
        setNote(analysis.note || null);
        setQuiz(analysis.quiz || null);
        setFlashcards(analysis.flashcards || null);
        setInputType(analysis.fileType);
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!user) return;
    setIsAnalyzing(true);
    setTranscription('');
    setNote(null);
    setQuiz(null);
    setFlashcards(null);

    try {
      let text = '';
      let fileName = '';
      let fileType: 'audio' | 'pdf' = 'audio';

      if (inputType === 'audio' && audioFile) {
        fileName = audioFile.name;
        fileType = 'audio';
        const uploadUrl = await uploadAudio(audioFile);
        text = await transcribeAudio(uploadUrl);
        setTranscription(text);
      } else if (inputType === 'pdf' && pdfFile) {
        fileName = pdfFile.name;
        fileType = 'pdf';
        text = await extractTextFromPDF(pdfFile);
      }

      if (text) {
        // Save initial analysis
        const analysisData: AnalysisData = {
          userId: user.uid,
          fileName,
          fileType,
          transcription: text,
        };
        const analysisId = await saveAnalysis(analysisData);

        // Generate and save AI content
        const [analysis, quizData, flashcardData] = await Promise.all([
          analyzeText(text),
          generateQuizFromText(text),
          generateFlashcardsFromText(text),
        ]);

        setNote(analysis);
        setQuiz(quizData);
        setFlashcards(flashcardData);

        // Update analysis with AI content
        await updateAnalysis(analysisId, {
          note: analysis,
          quiz: quizData,
          flashcards: flashcardData,
        });

        // Navigate to the new analysis
        navigate(`/features/${analysisId}`);
        // Refresh history after navigation so new item appears
        setTimeout(() => loadHistory(), 300);
      }
    } catch (error) {
      console.error('Error during analysis:', error);
      alert('Error occurred during analysis. Please try again.\n' + (error instanceof Error ? error.message : JSON.stringify(error)));
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
    setCurrentAnalysis(null);
    chunksRef.current = [];
    navigate('/features');
  };

  // Handler for New Chat (reset state, but keep history)
  const handleNewChat = () => {
    setIsRecording(false);
    setAudioFile(null);
    setPdfFile(null);
    setInputType(null);
    setTranscription('');
    setIsAnalyzing(false);
    setNote(null);
    setQuiz(null);
    setFlashcards(null);
    setCurrentAnalysis(null);
    chunksRef.current = [];
  };

  // Save handler
  const handleSave = async () => {
    if (!user || saved) return;
    try {
      const analysisData: AnalysisData = {
        userId: user.uid,
        fileName: fileNameForHeading,
        fileType: inputType || 'pdf',
        transcription,
        note,
        quiz: quiz || [],
        flashcards: flashcards || [],
      };
      const newId = await saveAnalysis(analysisData);
      setAnalysisId(newId);
      setSaved(true);
      await loadHistory();
      navigate(`/features/${newId}`);
    } catch (error) {
      alert('Failed to save analysis.');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Delete handler for sidebar
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      await deleteAnalysis(id);
      await loadHistory();
      if (currentAnalysis?.id === id) {
        navigate('/features');
        setCurrentAnalysis(null);
      }
    }
  };

  const isRoot = location.pathname === '/features';
  const fileNameForHeading = currentAnalysis?.fileName || note?.originalText?.fileName || '';
  const fileSummary = summarizeFileName(fileNameForHeading);

  return (
    <FeaturesContext.Provider value={{ note, quiz, flashcards, transcription, handleReset, currentAnalysis }}>
      <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-emerald-50">
        {/* Sidebar - flush with main content, no gap */}
        <HistorySidebar
          history={history}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNewChat={handleNewChat}
          onDelete={handleDelete}
        />
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top bar for mobile and logout */}
          <div className="sticky top-0 z-20 bg-white flex items-center justify-between px-4 py-3 shadow-sm border-b">
            <div className="md:hidden flex items-center">
              <button
                className="text-2xl mr-3 focus:outline-none"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <span>☰</span>
              </button>
              <span className="font-bold text-lg text-emerald-700">Speech or PDF Analyzer</span>
            </div>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all shadow"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
          <div className="flex flex-col items-center justify-start min-h-[80vh] w-full max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-8 drop-shadow-lg">
              <FaMagicIcon className="inline-block text-emerald-500 mr-2 mb-1 animate-bounce" />
              Speech or PDF Analyzer
            </h1>
            {/* Show Save button after analysis but before saving */}
            {(note || quiz || flashcards) && !saved && (
              <button
                className="mb-6 px-6 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all shadow flex items-center gap-2"
                onClick={handleSave}
              >
                <FaSmileIcon className="text-xl" /> Save
              </button>
            )}
            {/* Show heading above AI features if not on /features and there is a file */}
            {(currentAnalysis || note || quiz || flashcards) && !isRoot && fileSummary && (
              <h1 className="text-2xl font-bold text-center text-emerald-700 mb-8">
                Your {fileSummary} is Complete
              </h1>
            )}
            {isRoot && (
              <>
                {/* Upload/Analyze UI */}
                <div className="flex flex-col md:flex-row gap-8 justify-center mb-8 w-full">
                  <div className="flex-1 flex flex-col items-center bg-white rounded-2xl shadow-lg p-8 mx-2 mb-4 border-t-4 border-blue-200 hover:border-emerald-400 transition">
                    <div className="mb-4 text-3xl text-blue-500"><FaMicrophoneIcon /></div>
                    <AudioSection
                      isRecording={isRecording}
                      onStartRecording={startRecording}
                      onStopRecording={stopRecording}
                      onFileUpload={handleAudioFileUpload}
                      audioFile={audioFile}
                    />
                  </div>
                  <div className="flex-1 flex flex-col items-center bg-white rounded-2xl shadow-lg p-8 mx-2 mb-4 border-t-4 border-emerald-200 hover:border-blue-400 transition">
                    <div className="mb-4 text-3xl text-emerald-500"><FaFilePdfIcon /></div>
                    <PdfSection
                      onFileUpload={handlePdfFileUpload}
                      pdfFile={pdfFile}
                    />
                  </div>
                </div>
                <div className="flex justify-center mb-8 w-full">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!audioFile && !pdfFile)}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-400 to-blue-400 text-white rounded-xl font-bold text-lg shadow-lg hover:from-emerald-500 hover:to-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    <FaMagicIcon className="text-xl animate-pulse" />
                    {isAnalyzing ? 'Processing...' : '✨ Analyze'}
                  </button>
                </div>
              </>
            )}
            {/* Show AI Feature Links only after analysis and after saving */}
            {(currentAnalysis || note || quiz || flashcards) && (saved || currentAnalysis) && !isRoot && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 w-full">
                <Link to={`note`} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center hover:bg-emerald-50 transition group border-t-4 border-emerald-200 hover:border-emerald-400">
                  <FaStickyNoteIcon className="text-3xl text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">Notes</h3>
                  <p className="text-gray-600">View AI-generated notes and summaries.</p>
                </Link>
                <Link to={`quizzez`} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center hover:bg-blue-50 transition group border-t-4 border-blue-200 hover:border-blue-400">
                  <FaBrainIcon className="text-3xl text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">Quizzes</h3>
                  <p className="text-gray-600">Test yourself with AI-generated quizzes.</p>
                </Link>
                <Link to={`flashcard`} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center hover:bg-yellow-50 transition group border-t-4 border-yellow-200 hover:border-yellow-400">
                  <FaRegCloneIcon className="text-3xl text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold mb-2">Flashcards</h3>
                  <p className="text-gray-600">Review key facts with AI-generated flashcards.</p>
                </Link>
              </div>
            )}
            {/* Render the selected AI feature */}
            <div className="pb-8 w-full">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </FeaturesContext.Provider>
  );
};

export default Features; 