import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import './CharterGuestForm.css';

interface FormData {
  [key: string]: any;
}

const CharterGuestForm = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [lockedFields, setLockedFields] = useState<FormData>({});
  const [formData, setFormData] = useState<FormData>({ guests: ['', '', '', ''] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasPrinted, setHasPrinted] = useState(false);

  useEffect(() => {
    loadForm();
  }, [id]);

  // Initialize Google Places Autocomplete for address field
  useEffect(() => {
    if (!loading && typeof window !== 'undefined' && (window as any).google) {
      const addressInput = document.getElementById('guest-address-input') as HTMLInputElement;
      if (addressInput) {
        const addressAutocomplete = new (window as any).google.maps.places.Autocomplete(addressInput, {
          types: ['address'],
          componentRestrictions: { country: ['us', 'vg', 'vi'] }
        });
        addressAutocomplete.addListener('place_changed', () => {
          const place = addressAutocomplete.getPlace();
          if (place.formatted_address) {
            handleChange('address', place.formatted_address);
          }
        });
      }
    }
  }, [loading]);

  // If opened with ?print=1, auto-trigger browser print once the form is loaded
  useEffect(() => {
    const shouldPrint = searchParams.get('print') === '1';
    if (!loading && !submitted && shouldPrint && !hasPrinted) {
      setHasPrinted(true);
      window.print();
    }
  }, [loading, submitted, searchParams, hasPrinted]);

  const loadForm = async () => {
    if (!id) return;
    
    try {
      const formDoc = await getDoc(doc(db, 'charterRegistrations', id));
      if (formDoc.exists()) {
        const data = formDoc.data();
        setLockedFields(data.lockedFields || {});
        const guestData = data.guestData || {};
        setLockedFields(data.lockedFields || {});
        setFormData(prev => ({
          ...prev,
          ...guestData,
          guests: Array.isArray(guestData.guests)
            ? [...guestData.guests, '', '', '', ''].slice(0, 4)
            : ['', '', '', ''],
        }));

        // Pre-fill customer name from locked fields if available
        if (data.lockedFields?.chartererName && !guestData.fullName) {
          setFormData(prev => ({
            ...prev,
            fullName: data.lockedFields.chartererName
          }));
        }
      } else {
        alert('Form not found');
      }
    } catch (error) {
      console.error('Error loading form:', error);
      alert('Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Ensure we're saving all form data, including any fields that might have been filled
      const dataToSave: any = {
        guestData: {
          ...formData,
          // Include any fields that were filled but might not be in formData
          fullName: formData.fullName || '',
          phone: formData.phone || '',
          email: formData.email || lockedFields.email || '',
          address: formData.address || '',
          allergies: formData.allergies || '',
          medical: formData.medical || '',
          experience: formData.experience || '',
          lifejackets: formData.lifejackets || '',
          nonSlip: formData.nonSlip || false,
          emgName: formData.emgName || '',
          emgPhone: formData.emgPhone || '',
          emgRelation: formData.emgRelation || '',
          agreePolicies: formData.agreePolicies || false,
          agreeWaiver: formData.agreeWaiver || false,
          photoConsent: formData.photoConsent || false,
          signature: formData.signature || '',
          notes: formData.notes || '',
          guests: Array.isArray(formData.guests)
            ? formData.guests.map((g: any) => (typeof g === 'string' ? g.trim() : '')).filter(Boolean)
            : [],
          charterType: formData.charterType || lockedFields.charterType || '',
          charterStartDate: formData.charterStartDate || lockedFields.charterStartDate || '',
          charterStartTime: formData.charterStartTime || lockedFields.charterStartTime || '',
          charterEndDate: formData.charterEndDate || lockedFields.charterEndDate || '',
          charterEndTime: formData.charterEndTime || lockedFields.charterEndTime || '',
          duration: formData.duration || lockedFields.duration || '',
          location: formData.location || lockedFields.location || '',
          partySize: formData.partySize || lockedFields.partySize || 1
        },
        status: 'completed',
        updatedAt: serverTimestamp()
      };

      console.log('Saving guest data:', dataToSave.guestData); // Debug log

      await setDoc(doc(db, 'charterRegistrations', id!), dataToSave, { merge: true });

      console.log('Form submitted successfully!'); // Debug log
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading form...</div>;
  }

  if (submitted) {
    return (
      <div className="charter-guest-form">
        <div className="success-message">
          <h2>Thank You!</h2>
          <p>Your charter registration form has been submitted successfully.</p>
          <p>We'll be in touch soon to confirm your booking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="charter-guest-form">
      <div className="form-header">
        <h1>Charter Guest Registration</h1>
        <p className="form-description">
          Please complete the form below. Some fields have been pre-filled by the captain and cannot be changed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="guest-form">
        {/* Charter Details */}
        <fieldset className="form-section">
          <legend>Charter Details</legend>
          <div className="form-grid">
            <div className="form-group">
              <label>Charter Start Date *</label>
              <input
                type="date"
                value={lockedFields.charterStartDate || formData.charterStartDate || ''}
                onChange={(e) => handleChange('charterStartDate', e.target.value)}
                disabled={!!lockedFields.charterStartDate}
                required
              />
            </div>
            <div className="form-group">
              <label>Charter Start Time *</label>
              <input
                type="time"
                value={lockedFields.charterStartTime || formData.charterStartTime || ''}
                onChange={(e) => handleChange('charterStartTime', e.target.value)}
                disabled={!!lockedFields.charterStartTime}
                required
              />
            </div>
            <div className="form-group">
              <label>Charter End Date *</label>
              <input
                type="date"
                value={lockedFields.charterEndDate || formData.charterEndDate || ''}
                onChange={(e) => handleChange('charterEndDate', e.target.value)}
                disabled={!!lockedFields.charterEndDate}
                required
              />
            </div>
            <div className="form-group">
              <label>Charter End Time *</label>
              <input
                type="time"
                value={lockedFields.charterEndTime || formData.charterEndTime || ''}
                onChange={(e) => handleChange('charterEndTime', e.target.value)}
                disabled={!!lockedFields.charterEndTime}
                required
              />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input
                type="text"
                value={lockedFields.duration || formData.duration || ''}
                disabled
                className="readonly"
              />
            </div>
            <div className="form-group">
              <label>Charter Type *</label>
              <select
                value={lockedFields.charterType || formData.charterType || ''}
                onChange={(e) => handleChange('charterType', e.target.value)}
                disabled={!!lockedFields.charterType}
                required
              >
                <option value="">Select...</option>
                <option>Sunset Sail</option>
                <option>Half-Day</option>
                <option>Full-Day</option>
                <option>Private Lesson / Coaching</option>
                <option>Special Event</option>
                <option>Custom</option>
              </select>
            </div>
            <div className="form-group">
              <label>Number of Guests *</label>
              <input
                type="number"
                value={lockedFields.partySize || formData.partySize || ''}
                onChange={(e) => handleChange('partySize', parseInt(e.target.value) || 1)}
                disabled={!!lockedFields.partySize}
                min="1"
                max="14"
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Location *</label>
              <input
                type="text"
                value={lockedFields.location || formData.location || ''}
                disabled={!!lockedFields.location}
                required
              />
            </div>
          </div>
        </fieldset>

        {/* Lead Guest */}
        <fieldset className="form-section">
          <legend>Lead Guest (Primary Contact)</legend>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.fullName || ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={lockedFields.email || formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={!!lockedFields.email}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Mailing Address</label>
              <input
                type="text"
                id="guest-address-input"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Start typing your address..."
              />
            </div>
          </div>
        </fieldset>

        {/* Charter Agreement - Show Locked Fields */}
        {Object.keys(lockedFields).length > 0 && (
          <fieldset className="form-section locked-section">
            <legend>Charter Agreement (Pre-filled by Captain)</legend>
            <div className="locked-notice">
              The following information has been pre-filled by the captain and cannot be changed.
            </div>
            <div className="form-grid">
              {lockedFields.agreementDateText && (
                <div className="form-group">
                  <label>Agreement Date</label>
                  <input type="text" value={lockedFields.agreementDateText} disabled />
                </div>
              )}
              {lockedFields.companyName && (
                <div className="form-group">
                  <label>Company</label>
                  <input type="text" value={lockedFields.companyName} disabled />
                </div>
              )}
              {lockedFields.yachtModel && (
                <div className="form-group">
                  <label>Yacht Model</label>
                  <input type="text" value={lockedFields.yachtModel} disabled />
                </div>
              )}
              {lockedFields.yachtName && (
                <div className="form-group">
                  <label>Yacht Name</label>
                  <input type="text" value={lockedFields.yachtName} disabled />
                </div>
              )}
              {lockedFields.charterFee && (
                <div className="form-group">
                  <label>Charter Fee</label>
                  <input type="number" step="0.01" value={lockedFields.charterFee} disabled />
                </div>
              )}
              {lockedFields.totalAmount && (
                <div className="form-group">
                  <label><strong>Total Amount</strong></label>
                  <input type="number" step="0.01" value={lockedFields.totalAmount} disabled className="total-amount" />
                </div>
              )}
              {lockedFields.depositDue && (
                <div className="form-group">
                  <label><strong>Deposit Due</strong></label>
                  <input type="number" step="0.01" value={lockedFields.depositDue} disabled className="deposit-amount" />
                </div>
              )}
            </div>
          </fieldset>
        )}

        {/* Guest Roster */}
        <fieldset className="form-section">
          <legend>Guest Roster</legend>
          <p className="form-description">
            List additional guests (names only). Add age if any guest is a minor.
          </p>
          <div className="form-grid">
            <div className="form-group">
              <label>Guest 1</label>
              <input
                type="text"
                value={formData.guests?.[0] || ''}
                onChange={(e) => {
                  const guests = Array.isArray(formData.guests) ? [...formData.guests] : ['', '', '', ''];
                  guests[0] = e.target.value;
                  handleChange('guests', guests);
                }}
                placeholder="Guest 1 — Full name (Age)"
              />
            </div>
            <div className="form-group">
              <label>Guest 2</label>
              <input
                type="text"
                value={formData.guests?.[1] || ''}
                onChange={(e) => {
                  const guests = Array.isArray(formData.guests) ? [...formData.guests] : ['', '', '', ''];
                  guests[1] = e.target.value;
                  handleChange('guests', guests);
                }}
                placeholder="Guest 2 — Full name (Age)"
              />
            </div>
            <div className="form-group">
              <label>Guest 3</label>
              <input
                type="text"
                value={formData.guests?.[2] || ''}
                onChange={(e) => {
                  const guests = Array.isArray(formData.guests) ? [...formData.guests] : ['', '', '', ''];
                  guests[2] = e.target.value;
                  handleChange('guests', guests);
                }}
                placeholder="Guest 3 — Full name (Age)"
              />
            </div>
            <div className="form-group">
              <label>Guest 4</label>
              <input
                type="text"
                value={formData.guests?.[3] || ''}
                onChange={(e) => {
                  const guests = Array.isArray(formData.guests) ? [...formData.guests] : ['', '', '', ''];
                  guests[3] = e.target.value;
                  handleChange('guests', guests);
                }}
                placeholder="Guest 4 — Full name (Age)"
              />
            </div>
          </div>
        </fieldset>

        {/* Safety & Health */}
        <fieldset className="form-section">
          <legend>Safety & Health</legend>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Dietary Restrictions / Allergies</label>
              <textarea
                value={formData.allergies || ''}
                onChange={(e) => handleChange('allergies', e.target.value)}
                rows={3}
              />
            </div>
            <div className="form-group full-width">
              <label>Relevant Medical Notes</label>
              <textarea
                value={formData.medical || ''}
                onChange={(e) => handleChange('medical', e.target.value)}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Sailing Experience *</label>
              <select
                value={formData.experience || ''}
                onChange={(e) => handleChange('experience', e.target.value)}
                required
              >
                <option value="">Select...</option>
                <option>First time</option>
                <option>Some experience</option>
                <option>Experienced sailor</option>
              </select>
            </div>
            <div className="form-group">
              <label>Life Jacket Sizes Needed *</label>
              <input
                type="text"
                value={formData.lifejackets || ''}
                onChange={(e) => handleChange('lifejackets', e.target.value)}
                placeholder="e.g., 2x Adult, 1x Youth"
                required
              />
            </div>
          </div>
        </fieldset>

        {/* Emergency Contact */}
        <fieldset className="form-section">
          <legend>Emergency Contact</legend>
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.emgName || ''}
                onChange={(e) => handleChange('emgName', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={formData.emgPhone || ''}
                onChange={(e) => handleChange('emgPhone', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Relationship</label>
              <input
                type="text"
                value={formData.emgRelation || ''}
                onChange={(e) => handleChange('emgRelation', e.target.value)}
              />
            </div>
          </div>
        </fieldset>

        {/* Policies & Waiver */}
        <fieldset className="form-section">
          <legend>Policies & Liability Waiver</legend>
          <div className="policies-content">
            <p><strong>Weather:</strong> The captain may cancel or reschedule for unsafe conditions.</p>
            <p><strong>Refund policy:</strong> Trip insurance is strongly advised. Cancellation policies apply.</p>
            <p><strong>Liability:</strong> I understand that boating involves inherent risks and I voluntarily assume all risks.</p>
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.agreePolicies || false}
                onChange={(e) => handleChange('agreePolicies', e.target.checked)}
                required
              />
              I have read and agree to the charter policies. *
            </label>
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.agreeWaiver || false}
                onChange={(e) => handleChange('agreeWaiver', e.target.checked)}
                required
              />
              I have read and agree to the liability waiver. *
            </label>
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.photoConsent || false}
                onChange={(e) => handleChange('photoConsent', e.target.checked)}
              />
              I consent to reasonable use of photos/video from this charter for marketing and storytelling.
            </label>
          </div>
        </fieldset>

        {/* Notes */}
        <fieldset className="form-section">
          <legend>Notes / Special Requests</legend>
          <div className="form-group">
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              placeholder="Birthday, proposal, special requests, etc."
            />
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Registration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CharterGuestForm;

