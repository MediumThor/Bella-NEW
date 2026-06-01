import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import ImageCropper from './ImageCropper';
import ImageUploadZone from './ImageUploadZone';
import './ProcessGallery.css';

interface ProcessImage {
  id: string;
  url: string;
  name: string;
  processStep: string;
  uploadedAt: any;
  uploadedBy: string;
}

const PROCESS_STEPS = [
  { id: 'design-consultation', label: 'Step 1: Design Consultation' },
  { id: 'precision-measuring', label: 'Step 2: Precision Measuring' },
  { id: 'slab-selection', label: 'Step 3: Slab Selection & Grain Matching' },
  { id: 'cnc-fabrication', label: 'Step 4: CNC Fabrication' },
  { id: 'quality-inspection', label: 'Step 5: Quality Inspection' },
  { id: 'professional-installation', label: 'Step 6: Professional Installation' },
];

const ProcessGallery = () => {
  const { currentUser } = useAuth();
  const [images, setImages] = useState<ProcessImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageName, setNewImageName] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [selectedStep, setSelectedStep] = useState<string>('design-consultation');
  const [uploading, setUploading] = useState(false);
  const [filterStep, setFilterStep] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [cropperCallback, setCropperCallback] = useState<((file: File) => void) | null>(null);

  const handleFileSelect = (file: File, callback: (file: File) => void) => {
    setCropperFile(file);
    setCropperCallback(() => callback);
  };

  const handleCropComplete = (croppedFile: File) => {
    if (cropperCallback) cropperCallback(croppedFile);
    setCropperFile(null);
    setCropperCallback(null);
  };

  const handleCropCancel = () => {
    setCropperFile(null);
    setCropperCallback(null);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const imagesRef = collection(db, 'processImages');
      const imagesQuery = query(imagesRef, orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(imagesQuery);

      const imagesData = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as ProcessImage[];

      setImages(imagesData);
    } catch (error) {
      console.error('Error fetching process images:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFileToStorage = async (file: File): Promise<string> => {
    if (!currentUser) throw new Error('You must be logged in to upload files');

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `process-images/${timestamp}-${sanitizedName}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newImageName.trim() || !selectedStep) {
      alert('Please provide image name and select a process step');
      return;
    }

    if (!newImageUrl.trim() && !newImageFile) {
      alert('Please provide an image URL, upload a file, or paste a screenshot');
      return;
    }

    setUploading(true);
    try {
      let imageUrl = newImageUrl.trim();
      if (newImageFile) {
        imageUrl = await uploadFileToStorage(newImageFile);
      }

      const docRef = await addDoc(collection(db, 'processImages'), {
        url: imageUrl,
        name: newImageName.trim(),
        processStep: selectedStep,
        uploadedAt: serverTimestamp(),
        uploadedBy: 'admin',
      });

      setImages([
        {
          id: docRef.id,
          url: imageUrl,
          name: newImageName.trim(),
          processStep: selectedStep,
          uploadedAt: new Date(),
          uploadedBy: 'admin',
        },
        ...images,
      ]);

      setNewImageUrl('');
      setNewImageName('');
      setNewImageFile(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await deleteDoc(doc(db, 'processImages', id));
      setImages(images.filter((img) => img.id !== id));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const filteredImages =
    filterStep === 'all' ? images : images.filter((img) => img.processStep === filterStep);

  const groupedImages = PROCESS_STEPS.map((step) => ({
    step,
    images: filteredImages.filter((img) => img.processStep === step.id),
  }));

  const visibleGroups =
    filterStep === 'all'
      ? groupedImages
      : groupedImages.filter(({ step }) => step.id === filterStep);

  const focusUploadForm = (stepId: string) => {
    setSelectedStep(stepId);
    document.getElementById('imageName')?.focus();
    document.querySelector('.process-gallery .admin-form')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  if (loading) {
    return <div className="admin-loading">Loading process gallery...</div>;
  }

  return (
    <div className="process-gallery">
      <div className="admin-section-header">
        <h2>Process Gallery</h2>
        <p className="admin-section-desc">
          Upload and manage images for each step of the Bella Stone process. These images appear on
          the Our Process page when users hover over timeline items.
        </p>
      </div>

      <form onSubmit={handleUpload} className="admin-form">
        <div className="admin-form-group">
          <label htmlFor="imageName">Image Name</label>
          <input
            type="text"
            id="imageName"
            value={newImageName}
            onChange={(e) => setNewImageName(e.target.value)}
            placeholder="Image description"
            required
          />
        </div>
        <div className="admin-form-group">
          <label htmlFor="imageUrl">Image URL (optional)</label>
          <input
            type="url"
            id="imageUrl"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <ImageUploadZone
          inputId="process-gallery-file"
          label="Upload or paste image"
          selectedFile={newImageFile}
          disabled={uploading}
          onFileSelect={(file) =>
            handleFileSelect(file, (croppedFile) => {
              setNewImageFile(croppedFile);
              setNewImageUrl('');
            })
          }
          onClear={() => setNewImageFile(null)}
        />
        <div className="admin-form-group">
          <label htmlFor="processStep">Process Step</label>
          <select
            id="processStep"
            value={selectedStep}
            onChange={(e) => setSelectedStep(e.target.value)}
            required
          >
            {PROCESS_STEPS.map((step) => (
              <option key={step.id} value={step.id}>
                {step.label}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-form-actions">
          <button type="submit" className="admin-btn-primary" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Add Image'}
          </button>
        </div>
      </form>

      <div className="admin-filter-row">
        <label htmlFor="filterStep">Filter by step</label>
        <select
          id="filterStep"
          value={filterStep}
          onChange={(e) => setFilterStep(e.target.value)}
          className="process-gallery__filter"
        >
          <option value="all">All Steps</option>
          {PROCESS_STEPS.map((step) => (
            <option key={step.id} value={step.id}>
              {step.label}
            </option>
          ))}
        </select>
      </div>

      <div className="process-gallery__groups">
        {visibleGroups.map(({ step, images: stepImages }) => (
          <div key={step.id} className="process-gallery__group">
            <h3 className="admin-step-group-title">{step.label}</h3>
            {stepImages.length === 0 ? (
              <div className="admin-step-empty">
                <p>No image set for this step yet.</p>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => focusUploadForm(step.id)}
                >
                  Add image for this step
                </button>
              </div>
            ) : (
              <div className="admin-images-grid">
                {stepImages.map((image) => (
                  <div key={image.id} className="admin-image-card">
                    <div className="admin-image-preview">
                      <img src={image.url} alt={image.name} />
                    </div>
                    <div className="admin-image-info">
                      <h4>{image.name}</h4>
                      <div className="admin-image-url">
                        <input
                          type="text"
                          value={image.url}
                          readOnly
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(image.url, image.id)}
                          className="admin-btn-secondary"
                        >
                          {copiedId === image.id ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(image.id)}
                        className="admin-btn-danger"
                      >
                        Delete Image
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {cropperFile && (
        <ImageCropper
          imageFile={cropperFile}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};

export default ProcessGallery;
