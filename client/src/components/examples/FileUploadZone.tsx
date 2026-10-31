import {useState} from 'react';
import FileUploadZone from '../FileUploadZone';

export default function FileUploadZoneExample() {
  const [file,setFile]=useState<File|null>(null);
  return (
    <div className="p-4 max-w-md">
      <FileUploadZone file={file} onFileSelect={setFile} />
    </div>
  );
}
