
import React, { useState, useRef } from 'react';
import { Upload, Copy, MousePointer2 } from 'lucide-react';

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
  isProcessing: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onUpload(files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full h-full p-8 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
        isDragging 
          ? 'bg-blue-50 border-2 border-dashed border-blue-400 m-4 rounded-xl' 
          : 'bg-transparent'
      } ${isProcessing ? 'pointer-events-none opacity-40' : ''}`}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#e5e7eb] mb-6">
        <Upload className="w-8 h-8 text-blue-600" />
      </div>
      
      <h3 className="text-xl font-bold text-[#111827] mb-2">Upload or Paste</h3>
      <p className="text-[#6b7280] text-sm text-center max-w-[240px] leading-relaxed">
        Drag an image here, click to browse, or just <span className="text-blue-600 font-bold">paste (Ctrl+V)</span> from your clipboard.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-[#9ca3af] uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-[#e5e7eb]">
          <Copy className="w-3 h-3" /> Paste Support
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-[#9ca3af] uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-[#e5e7eb]">
          <MousePointer2 className="w-3 h-3" /> Drag & Drop
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
