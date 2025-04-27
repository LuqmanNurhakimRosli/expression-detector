// import React, { useContext } from 'react';
// import { FeaturesContext } from './Features';
// import ResultSection from '../components/ResultSection';

// const Note = () => {
//   const { note, transcription, handleReset } = useContext(FeaturesContext);

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="max-w-4xl mx-auto px-4 py-12">
//         <ResultSection
//           inputType={transcription ? 'audio' : 'pdf'}
//           transcription={transcription}
//           note={note}
//           onReset={handleReset}
//           quiz={null}
//           flashcards={null}
//         />
//       </div>
//     </div>
//   );
// };

// export default Note; 
import { useContext } from 'react';
import { FeaturesContext } from './Features';
import Note from '../components/Note';

export default function NotePage() {
  const { note } = useContext(FeaturesContext);
  return <Note note={note} onClear={() => {}} />;
} 