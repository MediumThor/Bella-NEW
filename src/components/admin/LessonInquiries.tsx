import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './CharterManagement.css';

interface LessonInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  lessonType: string;
  message: string;
  createdAt: any;
  status?: 'new' | 'read' | 'attn';
}

const LessonInquiries = () => {
  const [inquiries, setInquiries] = useState<LessonInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      setLoading(true);
      try {
        const inquiriesRef = collection(db, 'lessonInquiries');
        const inquiriesQuery = query(inquiriesRef, orderBy('createdAt', 'desc'));
        const inquiriesSnapshot = await getDocs(inquiriesQuery);
        const inquiriesData = inquiriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LessonInquiry[];
        setInquiries(inquiriesData);
      } catch (error) {
        console.error('Error fetching lesson inquiries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const handleDeleteInquiry = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await deleteDoc(doc(db, 'lessonInquiries', id));
      setInquiries(inquiries.filter(i => i.id !== id));
    } catch (error) {
      console.error('Error deleting lesson inquiry:', error);
      alert('Failed to delete inquiry');
    }
  };

  const handleStatusChange = async (inquiry: LessonInquiry) => {
    let newStatus: 'read' | 'attn' = 'read';
    
    // Cycle: new → read, read → attn, attn → read
    if (!inquiry.status || inquiry.status === 'new') {
      newStatus = 'read';
    } else if (inquiry.status === 'read') {
      newStatus = 'attn';
    } else if (inquiry.status === 'attn') {
      newStatus = 'read';
    }
    
    try {
      await setDoc(
        doc(db, 'lessonInquiries', inquiry.id),
        { status: newStatus },
        { merge: true }
      );
      setInquiries(prev =>
        prev.map(i => (i.id === inquiry.id ? { ...i, status: newStatus } : i))
      );
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      alert('Failed to update inquiry status.');
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status || status === 'new') return 'New';
    if (status === 'read') return 'Seen';
    if (status === 'attn') return 'Attn';
    return 'New';
  };

  const getStatusClass = (status?: string) => {
    if (!status || status === 'new') return 'status-new';
    if (status === 'read') return 'status-contacted';
    if (status === 'attn') return 'status-attn';
    return 'status-new';
  };

  if (loading) {
    return <div className="loading">Loading lesson inquiries...</div>;
  }

  return (
    <div className="charter-management">
      <div className="section-header">
        <h2>Lesson Inquiries</h2>
      </div>

      <div className="registrations-section">
        {inquiries.length === 0 ? (
          <div className="empty-state">
            <p>No lesson inquiries yet.</p>
          </div>
        ) : (
          <div className="registrations-list">
            {inquiries.map(inquiry => (
              <div key={inquiry.id} className="registration-card">
                <div className="registration-header">
                  <div>
                    <h3>{inquiry.name || 'Unknown Contact'}</h3>
                    <p className="registration-email">{inquiry.email}</p>
                    <p className="inquiry-date" style={{ marginTop: '0.5rem' }}>
                      <strong>Received:</strong>{' '}
                      {inquiry.createdAt?.toDate
                        ? new Date(inquiry.createdAt.toDate()).toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="status-badge-container">
                    <button
                      type="button"
                      className={`status-badge-button ${getStatusClass(inquiry.status)}`}
                      onClick={() => handleStatusChange(inquiry)}
                    >
                      {getStatusLabel(inquiry.status)}
                    </button>
                  </div>
                </div>
                <div className="registration-details">
                  <p><strong>Course:</strong> {inquiry.lessonType}</p>
                  {inquiry.phone && <p><strong>Phone:</strong> {inquiry.phone}</p>}
                  <p style={{ whiteSpace: 'pre-wrap' }}>
                    <strong>Message:</strong><br />
                    {inquiry.message}
                  </p>
                </div>
                <div className="registration-actions">
                  <button
                    onClick={() => handleDeleteInquiry(inquiry.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonInquiries;

