import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
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
  { id: 'design-consultation', label: 'Design Consultation' },
  { id: 'precision-measuring', label: 'Precision Measuring' },
  { id: 'slab-selection', label: 'Slab Selection & Grain Matching' },
  { id: 'cnc-fabrication', label: 'CNC Fabrication' },
  { id: 'quality-inspection', label: 'Quality Inspection' },
  { id: 'professional-installation', label: 'Professional Installation' },
];

const ProcessGallery = () => {
  const [images, setImages] = useState<ProcessImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageName, setNewImageName] = useState('');
  const [selectedStep, setSelectedStep] = useState<string>('design-consultation');
  const [uploading, setUploading] = useState(false);
  const [filterStep, setFilterStep] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const imagesRef = collection(db, 'processImages');
      const imagesQuery = query(imagesRef, orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(imagesQuery);
      
      const imagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProcessImage[];
      
      setImages(imagesData);
    } catch (error) {
      console.error('Error fetching process images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newImageUrl.trim() || !newImageName.trim() || !selectedStep) {
      alert('Please provide image URL, name, and select a process step');
      return;
    }

    setUploading(true);
    try {
      const docRef = await addDoc(collection(db, 'processImages'), {
        url: newImageUrl.trim(),
        name: newImageName.trim(),
        processStep: selectedStep,
        uploadedAt: serverTimestamp(),
        uploadedBy: 'admin'
      });

      setImages([{
        id: docRef.id,
        url: newImageUrl.trim(),
        name: newImageName.trim(),
        processStep: selectedStep,
        uploadedAt: new Date(),
        uploadedBy: 'admin'
      }, ...images]);

      setNewImageUrl('');
      setNewImageName('');
      alert('Image added successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'processImages', id));
      setImages(images.filter(img => img.id !== id));
      alert('Image deleted successfully!');
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

  const filteredImages = filterStep === 'all' 
    ? images 
    : images.filter(img => img.processStep === filterStep);

  const groupedImages = PROCESS_STEPS.map(step => ({
    step: step,
    images: filteredImages.filter(img => img.processStep === step.id)
  }));

  if (loading) {
    return <div className="loading">Loading process gallery...</div>;
  }

  return (
    <div className="process-gallery">
      <div className="section-header">
        <h2>Process Gallery</h2>
        <p className="section-description">
          Upload and manage images for each step of the Bella Stone process. These images will appear 
          on the "Our Process" page when users hover over the timeline items.
        </p>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="upload-form">
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            type="url"
            id="imageUrl"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            required
          />
        </div>
        <div className="form-group">
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
        <div className="form-group">
          <label htmlFor="processStep">Process Step</label>
          <select
            id="processStep"
            value={selectedStep}
            onChange={(e) => setSelectedStep(e.target.value)}
            required
          >
            {PROCESS_STEPS.map(step => (
              <option key={step.id} value={step.id}>{step.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-upload" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Add Image'}
        </button>
      </form>

      {/* Filter */}
      <div className="filter-section">
        <label htmlFor="filterStep" style={{ marginRight: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
          Filter by step:
        </label>
        <select
          id="filterStep"
          value={filterStep}
          onChange={(e) => setFilterStep(e.target.value)}
          className="sort-dropdown"
        >
          <option value="all">All Steps</option>
          {PROCESS_STEPS.map(step => (
            <option key={step.id} value={step.id}>{step.label}</option>
          ))}
        </select>
      </div>

      {/* Images Grid */}
      {filteredImages.length === 0 ? (
        <div className="empty-state">
          <p>No images yet. Upload your first image above.</p>
        </div>
      ) : (
        <div className="process-images-container">
          {groupedImages.map(({ step, images: stepImages }) => {
            if (stepImages.length === 0) return null;
            
            return (
              <div key={step.id} className="process-step-group">
                <h3 className="step-group-title">{step.label}</h3>
                <div className="images-grid">
                  {stepImages.map(image => (
                    <div key={image.id} className="image-card">
                      <div className="image-preview">
                        <img src={image.url} alt={image.name} />
                      </div>
                      <div className="image-info">
                        <h4>{image.name}</h4>
                        <div className="image-url">
                          <input 
                            type="text" 
                            value={image.url} 
                            readOnly 
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                          />
                          <button 
                            onClick={() => copyToClipboard(image.url, image.id)}
                            className="btn-copy"
                          >
                            {copiedId === image.id ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                        <div className="image-meta">
                          <span className="meta-label">Step:</span>
                          <span className="meta-value">
                            {PROCESS_STEPS.find(s => s.id === image.processStep)?.label || image.processStep}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDelete(image.id)}
                          className="btn-delete-img"
                        >
                          Delete Image
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProcessGallery;

