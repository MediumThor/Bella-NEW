import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './CharterManagement.css';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: any;
  status?: 'new' | 'read' | 'attn';
  imageUrls?: string[];
}

const ContactInquiries = () => {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBy, setFilterBy] = useState<string>('all');

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const contactsRef = collection(db, 'contactMessages');
        const contactsQuery = query(contactsRef, orderBy('createdAt', 'desc'));
        const contactsSnapshot = await getDocs(contactsQuery);
        const contactsData = contactsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ContactMessage[];
        setContacts(contactsData);
      } catch (error) {
        console.error('Error fetching contact inquiries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Get unique subjects from all contacts
  const uniqueSubjects = Array.from(new Set(contacts.map(c => c.subject).filter(Boolean))).sort();

  // Filter and sort contacts
  const filteredContacts = [...contacts]
    .filter(contact => {
      if (filterBy === 'all') return true;
      return contact.subject === filterBy;
    })
    .sort((a, b) => {
      // Always sort by date (newest first)
      const aDate = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const bDate = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return bDate - aDate; // Descending order (newest first)
    });

  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await deleteDoc(doc(db, 'contactMessages', id));
      setContacts(contacts.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting contact inquiry:', error);
      alert('Failed to delete inquiry');
    }
  };

  const handleStatusChange = async (contact: ContactMessage) => {
    let newStatus: 'read' | 'attn' = 'read';
    
    // Cycle: new → read, read → attn, attn → read
    if (!contact.status || contact.status === 'new') {
      newStatus = 'read';
    } else if (contact.status === 'read') {
      newStatus = 'attn';
    } else if (contact.status === 'attn') {
      newStatus = 'read';
    }
    
    try {
      await setDoc(
        doc(db, 'contactMessages', contact.id),
        { status: newStatus },
        { merge: true }
      );
      setContacts(prev =>
        prev.map(c => (c.id === contact.id ? { ...c, status: newStatus } : c))
      );
    } catch (error) {
      console.error('Error updating contact status:', error);
      alert('Failed to update contact status.');
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
    return <div className="loading">Loading contact inquiries...</div>;
  }

  return (
    <div className="charter-management">
      <div className="section-header">
        <h2>Contact Inquiries</h2>
        <div className="section-header-controls">
          <label htmlFor="filter-by" style={{ marginRight: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
            Filter by:
          </label>
          <select
            id="filter-by"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="sort-dropdown"
          >
            <option value="all">All (by date)</option>
            {uniqueSubjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="registrations-section">
        {contacts.length === 0 ? (
          <div className="empty-state">
            <p>No contact inquiries yet.</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="empty-state">
            <p>No inquiries found for the selected filter.</p>
          </div>
        ) : (
          <div className="registrations-list">
            {filteredContacts.map(contact => (
              <div key={contact.id} className="registration-card">
                <div className="registration-header">
                  <div>
                    <h3>{contact.name || 'Unknown Contact'}</h3>
                    <p className="registration-email">{contact.email}</p>
                  </div>
                  <div className="status-badge-container">
                    <button
                      type="button"
                      className={`status-badge-button ${getStatusClass(contact.status)}`}
                      onClick={() => handleStatusChange(contact)}
                    >
                      {getStatusLabel(contact.status)}
                    </button>
                  </div>
                </div>
                <div className="registration-details">
                  <p>
                    <strong>Received:</strong>{' '}
                    {contact.createdAt?.toDate
                      ? new Date(contact.createdAt.toDate()).toLocaleString()
                      : 'N/A'}
                  </p>
                  <p><strong>Subject:</strong> {contact.subject}</p>
                  {contact.phone && <p><strong>Phone:</strong> {contact.phone}</p>}
                  <p style={{ whiteSpace: 'pre-wrap' }}>
                    <strong>Message:</strong><br />
                    {contact.message}
                  </p>
                  {contact.imageUrls && contact.imageUrls.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <strong>Uploaded Images ({contact.imageUrls.length}):</strong>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                        gap: '0.75rem', 
                        marginTop: '0.5rem' 
                      }}>
                        {contact.imageUrls.map((url, index) => (
                          <a 
                            key={index} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                              display: 'block',
                              border: '1px solid #e0e0e0',
                              borderRadius: '4px',
                              overflow: 'hidden',
                              textDecoration: 'none'
                            }}
                          >
                            <img 
                              src={url} 
                              alt={`Upload ${index + 1}`}
                              style={{ 
                                width: '100%', 
                                height: '150px', 
                                objectFit: 'cover',
                                display: 'block'
                              }}
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="registration-actions">
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
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

export default ContactInquiries;


