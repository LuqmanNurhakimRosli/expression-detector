// src/services/pdfUtils.ts
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';

GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.js`;

export const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return text;
}; 