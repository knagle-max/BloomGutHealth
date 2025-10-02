import { useState } from 'react';
import { Upload, FileText, Check } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string[];
  maxSizeMB?: number;
}

export default function FileUploadZone({ 
  onFileSelect, 
  acceptedFormats = ['PDF', 'CSV', 'TXT', 'JSON'],
  maxSizeMB = 10 
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    setUploadedFile(file);
    onFileSelect(file);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed p-8 transition-all ${
        isDragging 
          ? 'border-primary bg-primary/5' 
          : uploadedFile
          ? 'border-green-500 bg-green-500/5'
          : 'border-muted bg-muted/20'
      }`}
      data-testid="upload-zone"
    >
      <input
        type="file"
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
        accept={acceptedFormats.map(f => `.${f.toLowerCase()}`).join(',')}
        data-testid="input-file"
      />
      <label 
        htmlFor="file-upload" 
        className="flex flex-col items-center gap-3 cursor-pointer"
      >
        {uploadedFile ? (
          <>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <FileText className="w-5 h-5" />
              <span className="font-medium">{uploadedFile.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium">Drag & drop your file or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports {acceptedFormats.join(', ')} (max {maxSizeMB}MB)
              </p>
            </div>
          </>
        )}
      </label>
    </div>
  );
}
