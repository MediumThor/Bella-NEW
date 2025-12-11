import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import BlogManagement from '../components/admin/BlogManagement';
import ImageLibrary from '../components/admin/ImageLibrary';
import ContactInquiries from '../components/admin/ContactInquiries';
import ProcessGallery from '../components/admin/ProcessGallery';
import JobRequests from '../components/admin/JobRequests';
import './AdminDashboard.css';

type TabType = 'blogs' | 'images' | 'content' | 'inquiries' | 'process-gallery' | 'job-requests';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('inquiries');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [newInquiryCounts, setNewInquiryCounts] = useState({
    contacts: 0,
  });
  const [attnInquiryCounts, setAttnInquiryCounts] = useState({
    contacts: 0,
  });

  useEffect(() => {
    // Set up real-time listeners for new inquiry counts
    const contactsRef = collection(db, 'contactMessages');
    const contactsNewQuery = query(contactsRef, where('status', '==', 'new'));
    const contactsAttnQuery = query(contactsRef, where('status', '==', 'attn'));

    // Real-time listener for new contact messages
    const unsubscribeContactsNew = onSnapshot(
      contactsNewQuery,
      (snapshot) => {
        setNewInquiryCounts(prev => ({
          ...prev,
          contacts: snapshot.size,
        }));
      },
      (error) => {
        console.error('Error listening to contact messages:', error);
      }
    );

    // Real-time listener for attn contact messages
    const unsubscribeContactsAttn = onSnapshot(
      contactsAttnQuery,
      (snapshot) => {
        setAttnInquiryCounts(prev => ({
          ...prev,
          contacts: snapshot.size,
        }));
      },
      (error) => {
        console.error('Error listening to attn contact messages:', error);
      }
    );

    // Cleanup: unsubscribe from all listeners when component unmounts
    return () => {
      unsubscribeContactsNew();
      unsubscribeContactsAttn();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <span className="user-email">{currentUser?.email}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'inquiries' ? 'active' : ''}`}
          onClick={() => setActiveTab('inquiries')}
        >
          Inquiries
          {newInquiryCounts.contacts > 0 && (
            <span className="notification-badge">{newInquiryCounts.contacts}</span>
          )}
          {attnInquiryCounts.contacts > 0 && (
            <span className="notification-badge notification-badge-attn">{attnInquiryCounts.contacts}</span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          Image Library
        </button>
        <button
          className={`tab-button ${activeTab === 'blogs' ? 'active' : ''}`}
          onClick={() => setActiveTab('blogs')}
        >
          Blog Posts
        </button>
        <button
          className={`tab-button ${activeTab === 'process-gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('process-gallery')}
        >
          Process Gallery
        </button>
        <button
          className={`tab-button ${activeTab === 'job-requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('job-requests')}
        >
          Job Requests
        </button>
        <button
          className={`tab-button tab-button-disabled`}
          disabled
          title="Page Content editor is temporarily disabled"
        >
          Page Content
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'blogs' && <BlogManagement />}
        {activeTab === 'images' && <ImageLibrary />}
        {activeTab === 'process-gallery' && <ProcessGallery />}
        {/* PageContentEditor kept for future use but not currently active */}
        {activeTab === 'inquiries' && <ContactInquiries />}
        {activeTab === 'job-requests' && <JobRequests />}
      </div>
    </div>
  );
};

export default AdminDashboard;
