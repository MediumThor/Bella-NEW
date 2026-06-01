import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiInbox,
  FiImage,
  FiBookOpen,
  FiLayers,
  FiBriefcase,
  FiMaximize2,
  FiFileText,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import BlogManagement from '../components/admin/BlogManagement';
import ImageLibrary from '../components/admin/ImageLibrary';
import ContactInquiries from '../components/admin/ContactInquiries';
import ProcessGallery from '../components/admin/ProcessGallery';
import JobRequests from '../components/admin/JobRequests';
import MeasurementRequests from '../components/admin/MeasurementRequests';
import '../styles/admin.css';
import './AdminDashboard.css';

type TabType =
  | 'blogs'
  | 'images'
  | 'inquiries'
  | 'process-gallery'
  | 'job-requests'
  | 'measurement-requests';

interface TabConfig {
  id: TabType;
  label: string;
  icon: ReactNode;
  badgeKey?: 'contacts' | 'measurements';
  attnKey?: 'contacts';
}

const TABS: TabConfig[] = [
  { id: 'inquiries', label: 'Inbox', icon: <FiInbox />, badgeKey: 'contacts', attnKey: 'contacts' },
  { id: 'images', label: 'Images', icon: <FiImage /> },
  { id: 'process-gallery', label: 'Gallery', icon: <FiLayers /> },
  { id: 'blogs', label: 'Blog', icon: <FiBookOpen /> },
  { id: 'job-requests', label: 'Jobs', icon: <FiBriefcase /> },
  { id: 'measurement-requests', label: 'Measure', icon: <FiMaximize2 />, badgeKey: 'measurements' },
];

const TAB_TITLES: Record<TabType, string> = {
  inquiries: 'Contact Inquiries',
  images: 'Image Library',
  'process-gallery': 'Process Gallery',
  blogs: 'Blog Posts',
  'job-requests': 'Job Requests',
  'measurement-requests': 'Measurement Requests',
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('inquiries');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [newInquiryCounts, setNewInquiryCounts] = useState({ contacts: 0, measurements: 0 });
  const [attnInquiryCounts, setAttnInquiryCounts] = useState({ contacts: 0 });

  useEffect(() => {
    const contactsRef = collection(db, 'contactMessages');
    const contactsNewQuery = query(contactsRef, where('status', '==', 'new'));
    const contactsAttnQuery = query(contactsRef, where('status', '==', 'attn'));

    const unsubscribeContactsNew = onSnapshot(
      contactsNewQuery,
      (snapshot) => setNewInquiryCounts((prev) => ({ ...prev, contacts: snapshot.size })),
      (error) => console.error('Error listening to contact messages:', error)
    );

    const unsubscribeContactsAttn = onSnapshot(
      contactsAttnQuery,
      (snapshot) => setAttnInquiryCounts((prev) => ({ ...prev, contacts: snapshot.size })),
      (error) => console.error('Error listening to attn contact messages:', error)
    );

    const measurementsRef = collection(db, 'measurementRequests');
    const measurementsNewQuery = query(measurementsRef, where('status', '==', 'new'));

    const unsubscribeMeasurementsNew = onSnapshot(
      measurementsNewQuery,
      (snapshot) => setNewInquiryCounts((prev) => ({ ...prev, measurements: snapshot.size })),
      (error) => console.error('Error listening to measurement requests:', error)
    );

    return () => {
      unsubscribeContactsNew();
      unsubscribeContactsAttn();
      unsubscribeMeasurementsNew();
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

  const renderContent = () => {
    switch (activeTab) {
      case 'blogs':
        return <BlogManagement />;
      case 'images':
        return <ImageLibrary />;
      case 'process-gallery':
        return <ProcessGallery />;
      case 'inquiries':
        return <ContactInquiries />;
      case 'job-requests':
        return <JobRequests />;
      case 'measurement-requests':
        return <MeasurementRequests />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-app bs-page-bg">
      <header className="admin-header glass-panel">
        <div className="admin-header__brand">
          <h1 className="admin-header__title">{TAB_TITLES[activeTab]}</h1>
          <p className="admin-header__subtitle">Bella Stone Admin</p>
        </div>
        <div className="admin-header__actions">
          <span className="admin-header__email">{currentUser?.email}</span>
          <button type="button" onClick={handleLogout} className="admin-btn-ghost">
            Logout
          </button>
        </div>
      </header>

      <main className="admin-content">
        <div className="admin-panel glass-panel">{renderContent()}</div>
      </main>

      <nav className="admin-tab-bar glass-panel--elevated" aria-label="Admin navigation">
        {TABS.map((tab) => {
          const badgeCount = tab.badgeKey ? newInquiryCounts[tab.badgeKey] : 0;
          const attnCount = tab.attnKey ? attnInquiryCounts[tab.attnKey] : 0;

          return (
            <button
              key={tab.id}
              type="button"
              className={`admin-tab ${activeTab === tab.id ? 'admin-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span className="admin-tab__icon">{tab.icon}</span>
              <span className="admin-tab__label">{tab.label}</span>
              {badgeCount > 0 && (
                <span className="admin-tab__badge">{badgeCount > 99 ? '99+' : badgeCount}</span>
              )}
              {attnCount > 0 && (
                <span className="admin-tab__badge admin-tab__badge--attn">{attnCount}</span>
              )}
            </button>
          );
        })}
        <button
          type="button"
          className="admin-tab admin-tab--disabled"
          disabled
          title="Page Content editor is temporarily disabled"
        >
          <span className="admin-tab__icon"><FiFileText /></span>
          <span className="admin-tab__label">Pages</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminDashboard;
