import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop, { makeAspectCrop, centerCrop } from 'react-image-crop';
import type { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './ImageCropper.css';

interface ImageCropperProps {
  imageFile: File | null;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

const ImageCropper = ({ imageFile, onCropComplete, onCancel, aspectRatio }: ImageCropperProps) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImgSrc(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onCancel]);

  useEffect(() => {
    if (imgSrc && imgRef.current) {
      const image = imgRef.current;
      const { naturalWidth, naturalHeight } = image;
      
      const crop = makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio || naturalWidth / naturalHeight,
        naturalWidth,
        naturalHeight
      );
      
      setCrop(centerCrop(crop, naturalWidth, naturalHeight));
    }
  }, [imgSrc, aspectRatio]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    
    if (aspectRatio) {
      const crop = makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio,
        naturalWidth,
        naturalHeight
      );
      setCrop(centerCrop(crop, naturalWidth, naturalHeight));
    } else {
      const crop = makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        naturalWidth / naturalHeight,
        naturalWidth,
        naturalHeight
      );
      setCrop(centerCrop(crop, naturalWidth, naturalHeight));
    }
  };

  const getCroppedImg = (): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (!completedCrop || !imgRef.current || !canvasRef.current) {
        reject(new Error('Crop data is missing'));
        return;
      }

      const image = imgRef.current;
      const canvas = canvasRef.current;
      const crop = completedCrop;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const pixelRatio = window.devicePixelRatio;
      const cropWidth = crop.width * scaleX;
      const cropHeight = crop.height * scaleY;
      
      canvas.width = cropWidth * pixelRatio;
      canvas.height = cropHeight * pixelRatio;

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = 'high';

      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;

      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }
        const file = new File([blob], imageFile?.name || 'cropped-image.jpg', {
          type: 'image/jpeg',
        });
        resolve(file);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropComplete = async () => {
    try {
      const croppedFile = await getCroppedImg();
      onCropComplete(croppedFile);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    }
  };

  if (!imgSrc) return null;

  return createPortal(
    <div
      className="image-cropper-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-cropper-title"
    >
      <button
        type="button"
        className="image-cropper-backdrop"
        onClick={onCancel}
        aria-label="Close crop dialog"
      />
      <div className="image-cropper-modal">
        <div className="image-cropper-header">
          <h3 id="image-cropper-title">Crop Image</h3>
          <button type="button" className="image-cropper-close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </div>
        <div className="image-cropper-content">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            className="image-cropper-react-crop"
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={imgSrc}
              style={{ maxWidth: '100%', maxHeight: '70vh' }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
          <canvas
            ref={canvasRef}
            style={{ display: 'none' }}
          />
        </div>
        <div className="image-cropper-actions">
          <button type="button" className="image-cropper-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="image-cropper-btn-apply" onClick={handleCropComplete}>
            Apply Crop
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageCropper;

