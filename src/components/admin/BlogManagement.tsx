import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './BlogManagement.css';

interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  author: string;
  createdAt: any;
  published: boolean;
}

const BlogManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const postsRef = collection(db, 'blogPosts');
      const q = query(postsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
      
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'blogPosts', id));
      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/edit-post/${id}`);
  };

  const handleNewPost = () => {
    navigate('/admin/new-post');
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  return (
    <div className="blog-management">
      <div className="section-header">
        <h2>Manage Blog Posts</h2>
        <button onClick={handleNewPost} className="btn-primary">
          + New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <p>No blog posts yet. Create your first post!</p>
        </div>
      ) : (
        <div className="posts-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id}>
                  <td className="post-title">{post.title}</td>
                  <td>{post.author}</td>
                  <td>
                    <span className={`status-badge ${post.published ? 'published' : 'draft'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    {post.createdAt?.toDate ? 
                      new Date(post.createdAt.toDate()).toLocaleDateString() : 
                      'N/A'
                    }
                  </td>
                  <td className="actions">
                    <button 
                      onClick={() => handleEdit(post.id)} 
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)} 
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;

