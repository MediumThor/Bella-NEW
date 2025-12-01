import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import './CharterInquiryForm.css';

const CharterInquiryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    charterDate: '',
    partySize: 1,
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'partySize' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const inquiryData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        charterDate: formData.charterDate,
        partySize: formData.partySize,
        message: formData.message.trim(),
        status: 'new',
        createdAt: serverTimestamp()
      };

      console.log('Submitting inquiry:', inquiryData);
      const docRef = await addDoc(collection(db, 'charterInquiries'), inquiryData);
      console.log('Inquiry submitted successfully with ID:', docRef.id);

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        charterDate: '',
        partySize: 1,
        message: ''
      });
    } catch (error: any) {
      console.error('Error submitting inquiry:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to submit inquiry. Please try again.';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Firestore security rules allow public writes to charterInquiries collection.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="inquiry-success">
        <h3>Thank You!</h3>
        <p>Your charter inquiry has been submitted successfully. We'll get back to you soon!</p>
        <button onClick={() => setSubmitted(false)} className="btn-resubmit">
          Submit Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <form className="charter-inquiry-form" onSubmit={handleSubmit}>
      <h3>Inquire About a Charter</h3>
      <p className="form-description">
        Fill out the form below and we'll get back to you with more information and availability.
      </p>

      <div className="form-group">
        <label htmlFor="name">Full Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
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
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone *</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 555 555 5555"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="charterDate">Preferred Charter Date *</label>
          <input
            type="date"
            id="charterDate"
            name="charterDate"
            value={formData.charterDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="partySize">Number of Guests *</label>
          <input
            type="number"
            id="partySize"
            name="partySize"
            value={formData.partySize}
            onChange={handleChange}
            min="1"
            max="14"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="message">Message / Special Requests</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          placeholder="Tell us about your group, any special occasions, or questions you have..."
        />
      </div>

      <button type="submit" className="btn-submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Inquiry'}
      </button>
    </form>
  );
};

export default CharterInquiryForm;

