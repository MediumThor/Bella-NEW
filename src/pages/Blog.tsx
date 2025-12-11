import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import './Page.css';
import './Blog.css';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  createdAt: any;
  publishedOn?: any;
  published: boolean;
  imageUrl?: string;
}

const getPlainTextFromHtml = (html: string): string => {
  if (!html) return '';
  if (typeof window === 'undefined') {
    // Fallback for safety; simple tag strip
    return html.replace(/<[^>]+>/g, ' ');
  }
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax');
      parallaxElements.forEach((element) => {
        const speed = element.getAttribute('data-speed') || '0.5';
        const yPos = -(scrolled * parseFloat(speed));
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    fetchPosts();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchPosts = async () => {
    try {
      const postsRef = collection(db, 'blogPosts');
      
      // Try query with published filter first
      let q = query(
        postsRef, 
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
        console.log('Fetched posts with published filter:', querySnapshot.docs.length);
      } catch (error: any) {
        // If composite index is needed, fetch all and filter client-side
        if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
          console.warn('Composite index needed. Fetching all posts and filtering client-side...');
          console.warn('Error details:', error);
          // Try without orderBy first
          try {
            q = query(postsRef, where('published', '==', true));
            querySnapshot = await getDocs(q);
            console.log('Fetched posts without orderBy:', querySnapshot.docs.length);
          } catch (err2: any) {
            console.warn('Still failed, fetching all posts:', err2);
            q = query(postsRef);
            querySnapshot = await getDocs(q);
            console.log('Fetched all posts:', querySnapshot.docs.length);
          }
        } else {
          throw error;
        }
      }
      
      let postsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Post data:', { id: doc.id, published: data.published, title: data.title });
        return {
          id: doc.id,
          ...data
        };
      }) as BlogPost[];
      
      // Filter for published posts if we fetched all
      const beforeFilter = postsData.length;
      postsData = postsData.filter(post => post.published === true);
      console.log(`Filtered posts: ${beforeFilter} -> ${postsData.length} published posts`);

      // Ensure newest posts appear first, even if Firestore query didn't sort
      postsData.sort((a, b) => {
        const aTs = a.publishedOn || a.createdAt;
        const bTs = b.publishedOn || b.createdAt;
        const aTime = aTs?.toMillis ? aTs.toMillis() : 0;
        const bTime = bTs?.toMillis ? bTs.toMillis() : 0;
        return bTime - aTime; // descending: newest first
      });

      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (post: BlogPost) => {
    const ts = post.publishedOn || post.createdAt;
    if (!ts) return 'No date';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="page-container">
      <section className="parallax-hero">
        <div 
          className="parallax-hero-image parallax" 
          data-speed="0.4"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)'
          }}
        >
          <div className="parallax-overlay">
            <h1>Blog & Stories</h1>
          </div>
        </div>
      </section>

      <div className="page-content">
        <div className="content-section">
          <p className="lead">
            Welcome to out. Here I share stories, insights, and updates about Smart Living, 
            wellness, leadership, sailing, and the journey of living intentionally.
          </p>
        </div>

        {loading ? (
          <div className="blog-loading">
            <p>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="content-section">
            <div className="blog-placeholder">
              <p>Blog posts coming soon! Check back regularly for new content.</p>
              <p>
                In the meantime, feel free to explore the other sections of the site or 
                reach out through the contact form if you'd like to connect.
              </p>
            </div>
          </div>
        ) : (
          <div className="blog-posts-container">
            {posts.map((post) => (
              <article key={post.id} className="blog-post-card">
                {post.imageUrl && (
                  <div className="blog-post-image">
                    <img src={post.imageUrl} alt={post.title} />
                  </div>
                )}
                <div className="blog-post-content">
                  <h2>{post.title}</h2>
                  <div className="blog-post-meta">
                    <span className="blog-post-date">{formatDate(post)}</span>
                    <span className="blog-post-author">By {post.author}</span>
                  </div>
                  {post.excerpt && (
                    <p className="blog-post-excerpt">{post.excerpt}</p>
                  )}
                  {(() => {
                    const isExpanded = expandedPosts[post.id] === true;
                    const plainText = getPlainTextFromHtml(post.content);
                    const words = plainText.split(/\s+/).filter(Boolean);
                    const needsTruncate = words.length > 100;
                    const previewText = needsTruncate
                      ? words.slice(0, 100).join(' ') + '…'
                      : plainText;

                    return (
                      <>
                        {isExpanded ? (
                          <div
                            className="blog-post-body"
                            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
                          />
                        ) : (
                          <p className="blog-post-body">
                            {previewText}
                          </p>
                        )}
                        {needsTruncate && (
                          <button
                            type="button"
                            className="blog-read-more"
                            onClick={() =>
                              setExpandedPosts((prev) => ({
                                ...prev,
                                [post.id]: !isExpanded,
                              }))
                            }
                          >
                            {isExpanded ? 'See less' : 'See more'}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="content-section">
          <h2>Stay Connected</h2>
          <p>
            Sign up for our newsletter or follow us on social media to stay updated on new 
            blog posts, webinars, and resources. I'm excited to share this journey with you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Blog;

