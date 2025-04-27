import { useContext } from 'react';
import { FeaturesContext } from './Features';
import FlashcardSection from '../components/FlashcardSection';

export default function FlashcardPage() {
  const { flashcards } = useContext(FeaturesContext);
  return <FlashcardSection flashcards={flashcards} />;
} 