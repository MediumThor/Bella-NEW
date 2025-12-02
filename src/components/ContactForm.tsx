import { useState } from 'react';
import type { FormEvent } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import './ContactForm.css';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const ContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: 'General Question',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [images, setImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear images when subject changes away from Quote Request
    if (name === 'subject' && value !== 'Quote Request') {
      setImages([]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Filter to only JPG/JPEG files
    const imageFiles = files.filter(file => {
      const extension = file.name.toLowerCase().split('.').pop();
      return extension === 'jpg' || extension === 'jpeg';
    });
    
    // Limit to 3 images
    if (images.length + imageFiles.length > 3) {
      alert('You can only upload up to 3 images');
      const remainingSlots = 3 - images.length;
      setImages([...images, ...imageFiles.slice(0, remainingSlots)]);
    } else {
      setImages([...images, ...imageFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      let imageUrls: string[] = [];

      // Upload images if Quote Request is selected
      if (formData.subject === 'Quote Request' && images.length > 0) {
        setUploadingImages(true);
        try {
          const uploadPromises = images.map(async (image, index) => {
            const timestamp = Date.now();
            const fileName = `quote-requests/${timestamp}-${index}-${image.name}`;
            const storageRef = ref(storage, fileName);
            await uploadBytes(storageRef, image);
            const url = await getDownloadURL(storageRef);
            return url;
          });
          imageUrls = await Promise.all(uploadPromises);
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          alert('Error uploading images. Please try again.');
          setUploadingImages(false);
          setIsSubmitting(false);
          return;
        } finally {
          setUploadingImages(false);
        }
      }

      const messageData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject,
        message: formData.message.trim(),
        status: 'new',
        createdAt: serverTimestamp(),
      };

      // Only include imageUrls if there are images (Firestore doesn't allow undefined)
      if (imageUrls.length > 0) {
        messageData.imageUrls = imageUrls;
      }

      await addDoc(collection(db, 'contactMessages'), messageData);

      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: 'General Question', message: '' });
      setImages([]);
      // Reset file input
      const fileInput = document.getElementById('images') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form-container">
      <p className="form-description">
        I am excited to connect with you. Fill out the contact form and I'll reach out as soon as I can.
      </p>
      
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Your name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your.email@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(414) 522-1918"
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject *</label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          >
            <option value="General Question">General Question</option>
            <option value="Countertop Inquiry">Countertop Inquiry</option>
            <option value="Design Consultation">Design Consultation</option>
            <option value="Quote Request">Quote Request</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="message">Message *</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            placeholder="Your message..."
          />
        </div>

        {formData.subject === 'Quote Request' && (
          <div className="form-group">
            <p className="image-upload-instruction">
              Please upload up to 3 JPG/JPEG pictures of your dimensioned drawings.
            </p>
            <label htmlFor="images">Upload Images (up to 3 JPG/JPEG files)</label>
            <input
              type="file"
              id="images"
              accept=".jpg,.jpeg"
              multiple
              onChange={handleImageChange}
              disabled={images.length >= 3}
            />
            {images.length > 0 && (
              <div className="uploaded-images-preview">
                <p className="images-count">{images.length} of 3 images selected</p>
                <div className="images-list">
                  {images.map((image, index) => (
                    <div key={index} className="image-preview-item">
                      <span className="image-name">{image.name}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-image-btn"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {submitStatus === 'success' && (
          <div className="form-message success">
            Thanks for submitting! I'll get back to you soon.
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="form-message error">
            There was an error submitting your form. Please try again or contact me directly.
          </div>
        )}

        <button type="submit" className="submit-button" disabled={isSubmitting || uploadingImages}>
          {uploadingImages ? 'Uploading images...' : isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;

