import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import './BlogPostEditor.css';

const BlogPostEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [published, setPublished] = useState(false);
  const [publishedOn, setPublishedOn] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      fetchPost();
    }
  }, [id, isEditing]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'blogPosts', id!);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTitle(data.title || '');
        setExcerpt(data.excerpt || '');
        setContent(data.content || '');
        setImageUrl(data.imageUrl || '');
        setPublished(data.published || false);
        if (data.publishedOn?.toDate) {
          const d = data.publishedOn.toDate();
          setPublishedOn(d.toISOString().slice(0, 10));
        }
      } else {
        alert('Post not found');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      alert('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Verify user is authenticated
      if (!currentUser) {
        alert('You must be logged in to create posts. Please log in again.');
        navigate('/admin/login');
        return;
      }

      const postData: any = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        published,
        author: currentUser.email || 'Unknown',
        updatedAt: serverTimestamp(),
      };

      // Only include imageUrl if it has a value (Firestore doesn't allow undefined)
      if (imageUrl.trim()) {
        postData.imageUrl = imageUrl.trim();
      }

      // Optional backdated published date for old posts
      if (publishedOn.trim()) {
        postData.publishedOn = new Date(publishedOn + 'T12:00:00');
      }

      if (isEditing && id) {
        // Update existing post
        await setDoc(doc(db, 'blogPosts', id), {
          ...postData,
          createdAt: (await getDoc(doc(db, 'blogPosts', id))).data()?.createdAt || serverTimestamp(),
        });
      } else {
        // Create new post
        const newDocRef = doc(collection(db, 'blogPosts'));
        await setDoc(newDocRef, {
          ...postData,
          createdAt: serverTimestamp(),
        });
      }

      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Error saving post:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`Failed to save post: ${errorMessage}\n\nCheck the browser console for more details.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="editor-loading">
        <div>Loading post...</div>
      </div>
    );
  }

  return (
    <div className="blog-post-editor">
      <div className="editor-header">
        <h1>{isEditing ? 'Edit Post' : 'New Post'}</h1>
        <button onClick={() => navigate('/admin/dashboard')} className="btn-cancel">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter post title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="excerpt">Excerpt</label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="Brief description of the post"
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Featured Image URL</label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="publishedOn">Published On (optional)</label>
          <input
            type="date"
            id="publishedOn"
            value={publishedOn}
            onChange={(e) => setPublishedOn(e.target.value)}
          />
          <p className="field-help">
            Set this if you&apos;re adding an older post and want it to appear with an earlier date.
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={20}
            placeholder="Write your post content here..."
            className="content-textarea"
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <span>Publish immediately</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogPostEditor;

