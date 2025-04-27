import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { AnalysisHistory } from '../services/database';
import { Timestamp } from 'firebase/firestore';

interface HistorySidebarProps {
  history: AnalysisHistory[];
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
}

// Helper to generate a friendly summary from a file name
function summarizeFileName(fileName: string | undefined): string {
  if (!fileName) return 'File';
  const name = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, isOpen, onClose, onNewChat, onDelete }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Sort history by createdAt descending
  const sortedHistory = [...history].sort((a, b) => {
    const aDate = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt);
    const bDate = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt);
    return bDate.getTime() - aDate.getTime();
  });

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-30 transition-opacity md:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 h-full z-40 bg-white border-r border-gray-200 shadow-lg transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:block w-64 flex-shrink-0`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">History</h2>
            <button className="md:hidden p-2" onClick={onClose} aria-label="Close sidebar">
              <span className="text-2xl">×</span>
            </button>
          </div>
          <button
            className="mb-4 px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all shadow flex items-center gap-2"
            onClick={() => { onNewChat(); navigate('/features'); onClose(); }}
          >
            <span>＋</span> New Chat
          </button>
          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {sortedHistory.length === 0 && (
              <div className="text-gray-400 text-sm text-center mt-8">No history yet.</div>
            )}
            {sortedHistory.map((item) => {
              const createdAt = item.createdAt instanceof Timestamp
                ? item.createdAt.toDate()
                : new Date(item.createdAt);
              return (
                <div key={item.id} className="flex items-center group">
                  <Link
                    to={`/features/${item.id}`}
                    className={`flex-1 block p-3 rounded-lg transition-colors whitespace-nowrap overflow-hidden text-ellipsis
                      ${id === item.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-gray-100 text-gray-700'}`}
                    onClick={onClose}
                    title={item.fileName}
                  >
                    <div className="font-medium truncate">{summarizeFileName(item.fileName)}</div>
                    <div className="text-xs text-gray-500">
                      {createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </Link>
                  <button
                    className="ml-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete"
                    onClick={e => { e.stopPropagation(); e.preventDefault(); onDelete(item.id); }}
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};

export default HistorySidebar; 