import { QuizQuestion } from '../components/QuizSection';
import { Flashcard } from '../components/FlashcardSection';

const API_KEY = process.env.REACT_APP_GOOGLE_AI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface NoteAnalysis {
  summary: string;
  keyPoints: string[];
  simplifiedText: string;
}

export const analyzeText = async (text: string): Promise<NoteAnalysis> => {
  if (!API_KEY) {
    throw new Error('Google AI API key is not configured. Please add REACT_APP_GOOGLE_AI_API_KEY to your .env file');
  }

  if (!text || text.trim().length === 0) {
    throw new Error('Text to analyze cannot be empty');
  }

  try {
    const prompt = `Analyze this text and format your response exactly like this:
Summary: [write a brief summary in 1-2 sentences]
Key Points:
- [first key point]
- [second key point]
- [third key point]
Simplified Text: [write a simplified version of the text]

Text to analyze: ${text}`;

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API Error:', errorData);
      throw new Error(errorData?.error?.message || 'Failed to analyze text');
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from AI service');
    }

    const analysis = data.candidates[0].content.parts[0].text;

    // Parse the AI response into structured format
    const summary = analysis.match(/Summary:(.*?)(?=Key Points:|$)/s)?.[1]?.trim() || '';
    const keyPoints = analysis.match(/Key Points:(.*?)(?=Simplified Text:|$)/s)?.[1]?.trim()
      .split('\n')
      .map((point: string) => point.trim())
      .filter((point: string) => point.startsWith('-'))
      .map((point: string) => point.substring(1).trim()) || [];
    const simplifiedText = analysis.match(/Simplified Text:(.*?)$/s)?.[1]?.trim() || '';

    if (!summary || !simplifiedText || keyPoints.length === 0) {
      throw new Error('Failed to parse AI response');
    }

    return {
      summary,
      keyPoints,
      simplifiedText
    };
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
};

export const generateQuizFromText = async (text: string): Promise<QuizQuestion[]> => {
  if (!API_KEY) {
    throw new Error('Google AI API key is not configured. Please add REACT_APP_GOOGLE_AI_API_KEY to your .env file');
  }
  if (!text || text.trim().length === 0) {
    throw new Error('Text to analyze cannot be empty');
  }
  const prompt = `You are a teacher. Your job is to take a document and create a multiple choice test (with 4 questions) based on the content of the document. Each question should have 4 options and indicate the correct answer index (0-based). Respond ONLY with the JSON array, no explanation, have markdown, no extra text. Format:\n[\n  {\n    "question": "...",\n    "options": ["...", "...", "...", "..."],\n    "correctIndex": 0\n  },\n  ...\n]\nDocument:\n${text}`;
  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  if (!response.ok) {
    throw new Error('Failed to generate quiz');
  }
  const data = await response.json();
  const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  // Extract the first JSON array from the response
  const match = aiText.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Failed to find quiz JSON in AI response');
  try {
    const quiz = JSON.parse(match[0]);
    return quiz;
  } catch {
    throw new Error('Failed to parse quiz from AI response');
  }
};

export const generateFlashcardsFromText = async (text: string): Promise<Flashcard[]> => {
  if (!API_KEY) {
    throw new Error('Google AI API key is not configured. Please add REACT_APP_GOOGLE_AI_API_KEY to your .env file');
  }
  if (!text || text.trim().length === 0) {
    throw new Error('Text to analyze cannot be empty');
  }
  const prompt = `You are a helpful assistant. Read the following document and generate 5 flashcards. Each flashcard should have a 'front' (the question or prompt) and a 'back' (the answer or explanation). Respond ONLY with a JSON array, no explanation, no markdown, no extra text. Format:\n[\n  {\n    "front": "...",\n    "back": "..."\n  },\n  ...\n]\nDocument:\n${text}`;
  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  if (!response.ok) {
    throw new Error('Failed to generate flashcards');
  }
  const data = await response.json();
  const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  console.log('AI flashcards raw response:', aiText);
  // Extract the first JSON array from the response
  const match = aiText.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Failed to find flashcards JSON in AI response. Full response: ' + aiText);
  try {
    const flashcards = JSON.parse(match[0]);
    return flashcards;
  } catch {
    throw new Error('Failed to parse flashcards from AI response. Full response: ' + aiText);
  }
}; 