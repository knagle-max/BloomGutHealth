import FileUploadZone from '../FileUploadZone';

export default function FileUploadZoneExample() {
  return (
    <div className="p-4 max-w-md">
      <FileUploadZone onFileSelect={(file) => console.log('File selected:', file.name)} />
    </div>
  );
}
