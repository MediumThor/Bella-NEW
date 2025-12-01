import { useState } from 'react';
import type { FormEvent } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import './LessonInquiryModal.css';

interface LessonInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonType: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const LessonInquiryModal = ({ isOpen, onClose, lessonType }: LessonInquiryModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await addDoc(collection(db, 'lessonInquiries'), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        lessonType: lessonType,
        message: formData.message.trim(),
        status: 'new',
        createdAt: serverTimestamp(),
      });

      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => {
        onClose();
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error submitting lesson inquiry:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="lesson-modal-backdrop" onClick={onClose} />
      <div className="lesson-modal">
        <div className="lesson-modal-header">
          <h2>Inquire About {lessonType}</h2>
          <button className="lesson-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="lesson-modal-body">
          <p className="lesson-modal-description">
            Fill out the form below to inquire about this course. I'll get back to you soon to discuss scheduling and details.
          </p>
          <form onSubmit={handleSubmit} className="lesson-inquiry-form">
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
              <label htmlFor="lessonType">Course *</label>
              <input
                type="text"
                id="lessonType"
                name="lessonType"
                value={lessonType}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Tell me about your sailing experience and what you'd like to learn..."
              />
            </div>

            {submitStatus === 'success' && (
              <div className="form-message success">
                Thanks for your inquiry! I'll get back to you soon.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="form-message error">
                There was an error submitting your form. Please try again.
              </div>
            )}

            <div className="lesson-modal-actions">
              <button type="button" onClick={onClose} className="btn-cancel">
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LessonInquiryModal;

