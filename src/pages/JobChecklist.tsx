import { useState } from 'react';
import type { FormEvent } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import './JobChecklist.css';

interface JobChecklistData {
  jobName: string;
  location: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  sinkModel: string;
  numberOfHoles: number;
  holePositions: number[];
  stoneSelection: string;
  numberOfVanities: string;
  otherInfo: string;
  drawingUrls: string[];
}

const JobChecklist = () => {
  const [formData, setFormData] = useState<JobChecklistData>({
    jobName: '',
    location: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    sinkModel: '',
    numberOfHoles: 0,
    holePositions: [],
    stoneSelection: '',
    numberOfVanities: '',
    otherInfo: '',
    drawingUrls: [],
  });
  const [drawings, setDrawings] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Sink dimensions (standard 33" sink, 4" increments = ~8 positions)
  const SINK_LENGTH = 33; // inches
  const HOLE_SPACING = 4; // inches
  const MAX_HOLES = 8; // Maximum number of hole positions

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberOfHolesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numHoles = parseInt(e.target.value) || 0;
    setFormData((prev) => ({
      ...prev,
      numberOfHoles: numHoles,
      holePositions: prev.holePositions.slice(0, numHoles), // Trim positions if reducing holes
    }));
  };

  const handleHolePositionChange = (position: number, checked: boolean) => {
    setFormData((prev) => {
      const newPositions = checked
        ? [...prev.holePositions, position].sort((a, b) => a - b)
        : prev.holePositions.filter((p) => p !== position);
      return {
        ...prev,
        holePositions: newPositions,
      };
    });
  };

  const handleDrawingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDrawings(files);
  };

  const removeDrawing = (index: number) => {
    setDrawings(drawings.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      let drawingUrls: string[] = [];

      // Upload drawings if any
      if (drawings.length > 0) {
        const uploadPromises = drawings.map(async (drawing, index) => {
          const timestamp = Date.now();
          const fileName = `job-drawings/${timestamp}-${index}-${drawing.name}`;
          const storageRef = ref(storage, fileName);
          await uploadBytes(storageRef, drawing);
          return await getDownloadURL(storageRef);
        });
        drawingUrls = await Promise.all(uploadPromises);
      }

      // Save to Firestore
      await addDoc(collection(db, 'jobRequests'), {
        ...formData,
        drawingUrls,
        status: 'new',
        createdAt: serverTimestamp(),
      });

      setSubmitStatus('success');
      // Reset form
      setFormData({
        jobName: '',
        location: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        sinkModel: '',
        numberOfHoles: 0,
        holePositions: [],
        stoneSelection: '',
        numberOfVanities: '',
        otherInfo: '',
        drawingUrls: [],
      });
      setDrawings([]);
      // Reset file input
      const fileInput = document.getElementById('drawings') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error submitting job checklist:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const holePositions = Array.from({ length: MAX_HOLES }, (_, i) => i * HOLE_SPACING);

  return (
    <div className="job-checklist-page">
      <div className="job-checklist-container">
        <h1 className="job-checklist-title">Job Checklist</h1>
        <p className="job-checklist-description">
          Complete this form with all job details for accurate quoting and fabrication.
        </p>

        <form onSubmit={handleSubmit} className="job-checklist-form">
          <div className="form-section">
            <h2 className="section-title">Job Information</h2>
            
            <div className="form-group">
              <label htmlFor="jobName">Job Name *</label>
              <input
                type="text"
                id="jobName"
                name="jobName"
                value={formData.jobName}
                onChange={handleChange}
                required
                placeholder="e.g., Smith Kitchen Remodel"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., 123 Main St, Milwaukee, WI 53202"
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Customer Information</h2>
            
            <div className="form-group">
              <label htmlFor="customerName">Customer Name *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                placeholder="Full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerEmail">Customer Email *</label>
              <input
                type="email"
                id="customerEmail"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                required
                placeholder="customer@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerPhone">Customer Phone *</label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                placeholder="(414) 555-1234"
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Sink Details</h2>
            
            <div className="form-group">
              <label htmlFor="sinkModel">Sink Model *</label>
              <input
                type="text"
                id="sinkModel"
                name="sinkModel"
                value={formData.sinkModel}
                onChange={handleChange}
                required
                placeholder="e.g., Kohler K-5960"
              />
            </div>

            <div className="form-group">
              <label htmlFor="numberOfHoles">Number of Holes *</label>
              <input
                type="number"
                id="numberOfHoles"
                name="numberOfHoles"
                value={formData.numberOfHoles}
                onChange={handleNumberOfHolesChange}
                required
                min="0"
                max="8"
                placeholder="0-8"
              />
            </div>

            {formData.numberOfHoles > 0 && (
              <div className="form-group">
                <label>Hole Positions (mark positions every 4 inches)</label>
                <div className="sink-hole-selector">
                  <div className="hole-positions-row">
                    {holePositions.map((position) => (
                      <label key={position} className="hole-position-label">
                        <input
                          type="checkbox"
                          checked={formData.holePositions.includes(position)}
                          onChange={(e) => handleHolePositionChange(position, e.target.checked)}
                          disabled={formData.holePositions.length >= formData.numberOfHoles && !formData.holePositions.includes(position)}
                        />
                        <span className="hole-position-marker">{position}"</span>
                      </label>
                    ))}
                  </div>
                  <div className="sink-visual">
                    <div className="sink-rectangle">
                      {formData.holePositions.map((position, index) => (
                        <div
                          key={index}
                          className="hole-marker"
                          style={{
                            left: `${(position / SINK_LENGTH) * 100}%`,
                          }}
                        >
                          <div className="hole-circle"></div>
                        </div>
                      ))}
                    </div>
                    <div className="sink-label">33" Standard Sink</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <h2 className="section-title">Material & Quantity</h2>
            
            <div className="form-group">
              <label htmlFor="stoneSelection">Stone Selection *</label>
              <input
                type="text"
                id="stoneSelection"
                name="stoneSelection"
                value={formData.stoneSelection}
                onChange={handleChange}
                required
                placeholder="e.g., Cambria Torquay, Granite, Quartz"
              />
            </div>

            <div className="form-group">
              <label htmlFor="numberOfVanities">Number of Vanities</label>
              <input
                type="text"
                id="numberOfVanities"
                name="numberOfVanities"
                value={formData.numberOfVanities}
                onChange={handleChange}
                placeholder="e.g., 2"
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Drawings & Additional Information</h2>
            
            <div className="form-group">
              <label htmlFor="drawings">Upload Drawings</label>
              <input
                type="file"
                id="drawings"
                accept="image/*,.pdf"
                multiple
                onChange={handleDrawingChange}
              />
              {drawings.length > 0 && (
                <div className="drawings-preview">
                  <p className="drawings-count">{drawings.length} file(s) selected</p>
                  <div className="drawings-list">
                    {drawings.map((drawing, index) => (
                      <div key={index} className="drawing-item">
                        <span className="drawing-name">{drawing.name}</span>
                        <button
                          type="button"
                          onClick={() => removeDrawing(index)}
                          className="remove-drawing-btn"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="otherInfo">Any Other Pertinent Information</label>
              <textarea
                id="otherInfo"
                name="otherInfo"
                value={formData.otherInfo}
                onChange={handleChange}
                rows={5}
                placeholder="Additional notes, special requirements, etc."
              />
            </div>
          </div>

          {submitStatus === 'success' && (
            <div className="form-message success">
              Job checklist submitted successfully!
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="form-message error">
              There was an error submitting the form. Please try again.
            </div>
          )}

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Job Checklist'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JobChecklist;

