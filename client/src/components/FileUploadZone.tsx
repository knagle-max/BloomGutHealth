import { useId,useRef,useState } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileUploadZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  acceptedFormats?: string[];
  maxSizeMB?: number;
  disabled?: boolean;
}

export default function FileUploadZone({
  file, onFileSelect,
  acceptedFormats = ['PDF', 'CSV', 'TXT', 'JSON'],
  maxSizeMB = 10, disabled = false
}: FileUploadZoneProps) {
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputId=useId(),inputRef=useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if(disabled)return;
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
    if(disabled)return;
    setError("");
    const extension = file.name.split(".").pop()?.toUpperCase();
    if (!extension || !acceptedFormats.includes(extension)) { setError(`Choose ${acceptedFormats.join(" or ")} format.`);onFileSelect(null);if(inputRef.current)inputRef.current.value="";return; }
    if (file.size > maxSizeMB * 1024 * 1024) { setError(`Choose a file no larger than ${maxSizeMB} MB.`);onFileSelect(null);if(inputRef.current)inputRef.current.value="";return; }
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
          : file
          ? 'border-primary bg-primary/5'
          : 'border-muted bg-muted/20'
      }`}
      aria-disabled={disabled}
      data-testid="upload-zone"
    >
      <input
        type="file"
        disabled={disabled}
        onChange={handleFileInput}
        className="sr-only peer"
        id={inputId}
        ref={inputRef}
        accept={acceptedFormats.map(f => `.${f.toLowerCase()}`).join(',')}
        data-testid="input-file"
      />
      <label
        htmlFor={inputId}
        className="flex flex-col items-center gap-3 cursor-pointer peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary"
      >
        {file ? (
          <>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2 text-primary">
              <FileText className="w-5 h-5" aria-hidden="true" />
              <span className="font-medium break-all min-w-0">{file.name}</span>
            </div>
            <p className="text-sm text-muted-foreground" role="status">Selected file · not uploaded</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" aria-hidden="true" />
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
      {file&&<button type="button" disabled={disabled} className="text-link mt-3" onClick={()=>{setError("");onFileSelect(null);if(inputRef.current)inputRef.current.value="";inputRef.current?.focus();}}>Remove selected file</button>}
      {error && <p role="alert" className="mt-3">{error}</p>}
    </div>
  );
}
