import { useContext } from 'react';
import { FeaturesContext } from './Features';
import QuizSection from '../components/QuizSection';

export default function QuizezPage() {
  const { quiz } = useContext(FeaturesContext);
  return <QuizSection quiz={quiz} />;
} 