import { useCallback, useEffect, useRef, useState } from 'react';
import { FiUploadCloud, FiClipboard, FiX, FiImage } from 'react-icons/fi';
import './ImageUploadZone.css';

interface ImageUploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  onClear?: () => void;
  disabled?: boolean;
  inputId?: string;
  label?: string;
}

const ImageUploadZone = ({
  onFileSelect,
  selectedFile,
  onClear,
  disabled = false,
  inputId = 'image-upload-input',
  label = 'Upload image',
}: ImageUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pasteHint, setPasteHint] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (disabled) return;
      const target = e.target as Node;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const named = new File(
              [file],
              `pasted-screenshot-${Date.now()}.png`,
              { type: file.type || 'image/png' }
            );
            processFile(named);
            setPasteHint(true);
            setTimeout(() => setPasteHint(false), 2000);
          }
          break;
        }
      }
    },
    [disabled, processFile]
  );

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  return (
    <div className="image-upload-zone-wrap">
      <span className="image-upload-zone__label">{label}</span>
      <div
        ref={zoneRef}
        className={`image-upload-zone ${isDragging ? 'image-upload-zone--dragging' : ''} ${disabled ? 'image-upload-zone--disabled' : ''} ${selectedFile ? 'image-upload-zone--has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Upload image by clicking, dragging, or pasting"
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          className="image-upload-zone__input"
          onChange={handleInputChange}
          disabled={disabled}
          tabIndex={-1}
        />

        {previewUrl ? (
          <div className="image-upload-zone__preview">
            <img src={previewUrl} alt="Selected preview" />
            {onClear && (
              <button
                type="button"
                className="image-upload-zone__clear"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                aria-label="Clear selected image"
              >
                <FiX />
              </button>
            )}
          </div>
        ) : (
          <div className="image-upload-zone__content">
            <div className="image-upload-zone__icons">
              <FiUploadCloud aria-hidden />
              <FiClipboard aria-hidden />
            </div>
            <p className="image-upload-zone__title">Drop, browse, or paste</p>
            <p className="image-upload-zone__hint">
              Drag a file here, click to browse, or press <kbd>⌘V</kbd> / <kbd>Ctrl+V</kbd> to paste a screenshot
            </p>
          </div>
        )}

        {pasteHint && (
          <div className="image-upload-zone__toast">
            <FiImage aria-hidden /> Screenshot pasted
          </div>
        )}
      </div>

      {selectedFile && (
        <p className="image-upload-zone__filename">{selectedFile.name}</p>
      )}
    </div>
  );
};

export default ImageUploadZone;
