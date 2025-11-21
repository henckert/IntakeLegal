'use client';

import { useCallback, useState } from 'react';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  acceptedTypes?: string[];
  maxSizeBytes?: number;
  disabled?: boolean;
}

const DEFAULT_ACCEPTED_TYPES = ['.docx', '.pdf', '.eml', '.wav', '.mp3'];
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function FileUpload({
  onUpload,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSizeBytes = DEFAULT_MAX_SIZE,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${Math.round(maxSizeBytes / 1024 / 1024)}MB limit`;
    }

    // Check file type
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(ext)) {
      return `File type not supported. Accepted: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFile = useCallback((file: File) => {
    setError('');
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
  }, [maxSizeBytes, acceptedTypes]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      await onUpload(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError('');
    setUploadProgress(0);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      docx: '📄',
      pdf: '📕',
      eml: '📧',
      wav: '🎵',
      mp3: '🎵',
    };
    return iconMap[ext || ''] || '📎';
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      {!selectedFile && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center transition-all
            ${isDragging ? 'border-accent bg-[#F0F4F8]' : 'border-border bg-[#F0F4F8] hover:border-accent/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <input
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            <div className="text-6xl">📁</div>
            <div>
              <p className="text-lg font-medium text-text-main font-body">
                Drop your file here or click to browse
              </p>
              <p className="text-sm text-text-muted mt-2">
                Supported: {acceptedTypes.join(', ')} (max {Math.round(maxSizeBytes / 1024 / 1024)}MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && !isUploading && uploadProgress === 0 && (
        <div className="border-2 border-accent rounded-2xl p-6 bg-surface shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{getFileIcon(selectedFile.name)}</div>
              <div>
                <p className="font-medium text-text-main">{selectedFile.name}</p>
                <p className="text-sm text-text-muted">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleUploadClick}
                className="px-6 py-2 bg-accent text-white font-medium rounded-xl hover:bg-primary-light transition-colors shadow-md"
              >
                Upload
              </button>
              <button
                onClick={handleRemove}
                className="px-4 py-2 text-text-muted hover:text-error transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="border-2 border-accent rounded-2xl p-6 bg-surface shadow-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{getFileIcon(selectedFile!.name)}</div>
                <div>
                  <p className="font-medium text-text-main">{selectedFile!.name}</p>
                  <p className="text-sm text-text-muted">Uploading... {uploadProgress}%</p>
                </div>
              </div>
            </div>
            <div className="w-full bg-border/30 rounded-full h-2 overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-error/10 border border-error/30 rounded-xl">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      {/* File Type Guide */}
      <div className="mt-6 p-4 bg-background rounded-xl border border-border">
        <p className="text-sm font-medium text-text-main mb-2">Supported file types:</p>
        <ul className="text-sm text-text-muted space-y-1">
          <li>📄 <strong>.docx</strong> - Word documents (intake letters, questionnaires)</li>
          <li>📕 <strong>.pdf</strong> - PDF documents (scanned forms, letters)</li>
          <li>📧 <strong>.eml</strong> - Email files (client correspondence)</li>
          <li>🎵 <strong>.wav, .mp3</strong> - Audio recordings (voice memos, calls)</li>
        </ul>
      </div>
    </div>
  );
}
