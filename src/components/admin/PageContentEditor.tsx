import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './PageContentEditor.css';

interface PageContent {
  [key: string]: string;
}

const pages = [
  { id: 'home', label: 'Home Page' },
  { id: 'sailing', label: 'Sailing' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'resources', label: 'Resources' },
  { id: 'connect', label: 'Connect' },
];

const PageContentEditor = () => {
  const [selectedPage, setSelectedPage] = useState('home');
  const [content, setContent] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPageContent(selectedPage);
  }, [selectedPage]);

  const fetchPageContent = async (pageId: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'pageContent', pageId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setContent(docSnap.data() as PageContent);
      } else {
        // Default content structure
        setContent({
          heroTitle: '',
          heroSubtitle: '',
          section1Title: '',
          section1Content: '',
          section2Title: '',
          section2Content: '',
          section3Title: '',
          section3Content: '',
        });
      }
    } catch (error) {
      console.error('Error fetching page content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'pageContent', selectedPage);
      await setDoc(docRef, content);
      alert('Page content saved successfully!');
    } catch (error) {
      console.error('Error saving page content:', error);
      alert('Failed to save page content');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setContent({ ...content, [field]: value });
  };

  if (loading) {
    return <div className="loading">Loading page content...</div>;
  }

  return (
    <div className="page-content-editor">
      <div className="section-header">
        <h2>Edit Page Content</h2>
        <p className="section-description">
          Edit text content for different pages. Note: This is for text content only. 
          Images and layout changes require code updates.
        </p>
      </div>

      <div className="page-selector">
        <label>Select Page:</label>
        <select 
          value={selectedPage} 
          onChange={(e) => setSelectedPage(e.target.value)}
          className="page-select"
        >
          {pages.map(page => (
            <option key={page.id} value={page.id}>
              {page.label}
            </option>
          ))}
        </select>
      </div>

      <div className="content-form">
        <div className="alert-info">
          <strong>Note:</strong> Content changes here will be stored in the database but need to be 
          integrated into the actual page components to display. This provides a foundation for 
          dynamic content management.
        </div>

        <div className="form-section">
          <h3>Hero Section</h3>
          <div className="form-group">
            <label>Hero Title</label>
            <input
              type="text"
              value={content.heroTitle || ''}
              onChange={(e) => handleChange('heroTitle', e.target.value)}
              placeholder="Main headline"
            />
          </div>
          <div className="form-group">
            <label>Hero Subtitle</label>
            <textarea
              value={content.heroSubtitle || ''}
              onChange={(e) => handleChange('heroSubtitle', e.target.value)}
              placeholder="Supporting text"
              rows={3}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Content Sections</h3>
          
          {[1, 2, 3].map(num => (
            <div key={num} className="subsection">
              <h4>Section {num}</h4>
              <div className="form-group">
                <label>Section {num} Title</label>
                <input
                  type="text"
                  value={content[`section${num}Title`] || ''}
                  onChange={(e) => handleChange(`section${num}Title`, e.target.value)}
                  placeholder={`Section ${num} title`}
                />
              </div>
              <div className="form-group">
                <label>Section {num} Content</label>
                <textarea
                  value={content[`section${num}Content`] || ''}
                  onChange={(e) => handleChange(`section${num}Content`, e.target.value)}
                  placeholder={`Section ${num} content`}
                  rows={5}
                />
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSave} 
          className="btn-save"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default PageContentEditor;

