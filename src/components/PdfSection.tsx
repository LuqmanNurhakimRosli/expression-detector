import React from 'react';

interface PdfSectionProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  pdfFile: File | null;
}

const PdfSection: React.FC<PdfSectionProps> = ({
  onFileUpload,
  pdfFile,
}) => (
  <div className="flex flex-col items-center bg-white rounded-xl shadow-md p-6 w-full max-w-xs mx-auto">
    <h2 className="text-lg font-semibold mb-4">PDF Section</h2>
    <input
      type="file"
      accept="application/pdf"
      onChange={onFileUpload}
      id="pdf-upload"
      className="hidden"
    />
    <label
      htmlFor="pdf-upload"
      className="block w-full text-center py-3 px-6 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600 mb-2"
    >
      📄 Upload PDF File
    </label>
    {pdfFile && (
      <span className="text-xs text-gray-500 mt-2">Selected: {pdfFile.name}</span>
    )}
  </div>
);

export default PdfSection; 