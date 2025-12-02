import { useEffect, useState, useRef } from 'react';
import ImageSlideshow from '../components/ImageSlideshow';
import ContactForm from '../components/ContactForm';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FaFacebook, FaInstagram, FaPhone, FaEnvelope } from 'react-icons/fa';
import './Home.css';

interface HomeSlide {
  id: string;
  url: string;
  name: string;
  createdAt: any;
}

const Home = () => {
  const [homeSlides, setHomeSlides] = useState<string[]>([]);
  const [loadingHomeSlides, setLoadingHomeSlides] = useState(true);
  const [homepageImage, setHomepageImage] = useState<string | null>(null);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.5 }
    );

    return () => {
      if (observerRef.current) {
        sectionsRef.current.forEach((section) => {
          if (section) observerRef.current?.unobserve(section);
        });
      }
    };
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    }
  };

  useEffect(() => {
    // Parallax scroll effect
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
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchHomeSlides = async () => {
      try {
        const slidesRef = collection(db, 'homeSlideshowImages');
        const slidesQuery = query(slidesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(slidesQuery);
        const fetched = snapshot.docs.map(doc => (doc.data() as HomeSlide).url).filter(Boolean);

        if (fetched.length > 0) {
          setHomeSlides(fetched);
        } else {
          // Fallback default images for home slideshow
          setHomeSlides([
            '/2.webp',
            '/3.webp',
            '/6.webp',
            '/7.webp',
            '/8.webp',
            '/9.webp',
            '/10.webp',
            '/11.webp',
            '/12.webp',
            '/13.webp',
          ]);
        }
      } catch (error) {
        console.error('Error fetching home slideshow images:', error);
        setHomeSlides([
          '/2.webp',
          '/3.webp',
          '/6.webp',
          '/7.webp',
          '/8.webp',
          '/9.webp',
          '/10.webp',
          '/11.webp',
          '/12.webp',
          '/13.webp',
        ]);
      } finally {
        setLoadingHomeSlides(false);
      }
    };

    const fetchHomepageImage = async () => {
      try {
        const homepageRef = collection(db, 'homepageImage');
        const snapshot = await getDocs(homepageRef);
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          if (data.url) {
            setHomepageImage(data.url);
          }
        }
      } catch (error) {
        console.error('Error fetching homepage image:', error);
      }
    };

    fetchHomeSlides();
    fetchHomepageImage();
  }, []);

  return (
    <div className="home-page">
      {/* Parallax Hero Section */}
      <section className="parallax-hero">
          <div 
          className="parallax-hero-image parallax"
            data-speed="0.2"
            style={{
            backgroundImage: homepageImage 
              ? `url(${homepageImage})` 
              : homeSlides.length > 0 
                ? `url(${homeSlides[0]})` 
                : 'url(/9.webp)'
            }}
          >
          <div className="parallax-hero-overlay">
            <h1 className="parallax-hero-title">Bella Stone</h1>
            <p className="parallax-hero-slogan">Where Elegance Meets Excellence</p>
          </div>
                </div>
      </section>

      {/* Quality Saying Section */}
      <section className="quality-saying-section" ref={addToRefs}>
        <div className="quality-saying-content">
          <p className="quality-saying-text">
            Quality countertops crafted with the most modern methods, combining timeless elegance 
            with cutting-edge precision. At Bella Stone, we transform your vision into reality 
            through innovative fabrication techniques and meticulous attention to detail. Since 2008.
                </p>
          
          {/* Contact Us Button */}
          <div className="contact-us-button-container">
                  <button
              className="contact-us-button"
                    onClick={() => {
                document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
              Contact Us
                  </button>
          </div>
          
          <div className="company-logos">
            <p style={{ width: '100%', textAlign: 'center', color: '#888', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Trusted by leading organizations
            </p>
            {/* Note: Add company logos here when available */}
            {/* Example placeholders - replace with actual logo images */}
            <div className="company-logo-placeholder" style={{ color: '#EADAB6', fontSize: '1.2rem', fontWeight: '600' }}>
              Milwaukee Bucks
                </div>
            <div className="company-logo-placeholder" style={{ color: '#EADAB6', fontSize: '1.2rem', fontWeight: '600' }}>
              Milwaukee Brewers
              </div>
            <div className="company-logo-placeholder" style={{ color: '#EADAB6', fontSize: '1.2rem', fontWeight: '600' }}>
              Sendik's
            </div>
          </div>
        </div>
      </section>

      {/* Slideshow Section */}
      <section className="slideshow-section" ref={addToRefs}>
        <div className="slideshow-wrapper">
          {loadingHomeSlides ? (
            <div className="loading">Loading gallery...</div>
          ) : (
            <ImageSlideshow images={homeSlides} />
          )}
        </div>
      </section> 

      {/* Our Process Section */}
      <section className="process-section" ref={addToRefs}>
        <div className="process-container">
          <h2 className="process-title">Our Process</h2>
          <div className="process-content">
            <div className="process-item">
              <h3>Design Consultation</h3>
            <p>
                Collaborate with our experts to find the perfect stone solution that aligns 
                with your vision and space requirements.
              </p>
            </div>
            <div className="process-item">
              <h3>Precision Measuring</h3>
              <p>
                Our state-of-the-art laser measuring technology ensures a perfect fit for 
                your countertops.
            </p>
            </div>
            <div className="process-item">
              <h3>Slab Selection & Grain Matching</h3>
              <p>
                Using our <strong>Horus slab scanner</strong> and <strong>Sasso K-600 miter saw</strong>, 
                we ensure all slabs are properly grain matched. This advanced technology allows us 
                to create seamless patterns and perfect alignment across multiple pieces.
              </p>
          </div>
            <div className="process-item">
              <h3>CNC Fabrication</h3>
            <p>
                Leveraging advanced CNC machinery, we guarantee intricate designs and 
                superior finish quality for every countertop.
            </p>
          </div>
            <div className="process-item">
              <h3>Professional Installation</h3>
            <p>
                Expert installation by our skilled team ensures your countertops are 
                perfectly placed and finished.
            </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section id="inquiry-form" className="inquiry-form-section" ref={addToRefs}>
        <div className="inquiry-form-container">
          <h2 className="inquiry-form-title">Get In Touch</h2>
          <div className="contact-info-links">
            <a href="tel:+1-414-617-8078" className="contact-info-link">
              <FaPhone size="1.5rem" />
              <span>414-617-8078</span>
            </a>
            <a href="mailto:bellastone@live.com" className="contact-info-link">
              <FaEnvelope size="1.5rem" />
              <span>bellastone@live.com</span>
            </a>
          </div>
          <ContactForm />
        </div>
      </section>

      <footer className="footer-landing">
        <div className="footer-content-landing">
          <a 
            href="https://www.google.com/maps/place/Bella+Stone,+LLc/@43.4641412,-87.9532781,14.4z/data=!4m6!3m5!1s0x8804ecb6d0b3058f:0x75c35b6057b78256!8m2!3d43.4583816!4d-87.948204!16s%2Fg%2F1vbnpzy2?entry=ttu" 
            target="_blank" 
            rel="noopener noreferrer"
            className="maps-button"
          >
            <img src="/BellaMap.png" alt="Location" style={{ width: '250px', height: '250px', borderRadius: '7px' }} />
          </a>

          <div className="contact-grid-footer">
            <a href="https://www.facebook.com/BellaStoneLLC/" target="_blank" rel="noopener noreferrer" className="social-button-top">
              <FaFacebook size="2rem" />
            </a>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="social-button-top">
              <FaInstagram size="2rem" />
            </a>
            <a href="tel:+1-414-617-8078" className="social-button-top">
              <FaPhone size="2rem" />
            </a>
            <a href="mailto:bellastone@live.com" className="social-button-top">
              <FaEnvelope size="2rem" />
            </a>
          </div>
        </div>
        <div className="footer-copyright">
          <p>Copyright Bella Stone LLC 2026</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
