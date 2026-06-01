import { useEffect, useState } from 'react';
import ImageSlideshow from '../components/ImageSlideshow';
import { motion, useReducedMotion } from 'motion/react';
import Footer from '../components/Footer';
import { openQuoteInquiryWidget } from '../utils/openQuoteInquiryWidget';
import './Home.css';

interface HomeSlide {
  id: string;
  url: string;
  name: string;
  createdAt: unknown;
}

const revealVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const Home = () => {
  const [homeSlides, setHomeSlides] = useState<string[]>([
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
  const reduceMotion = useReducedMotion();

  const revealTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const };

  useEffect(() => {
    const fetchHomeSlides = async () => {
      try {
        const [{ collection, getDocs, orderBy, query }, { db }] = await Promise.all([
          import('firebase/firestore'),
          import('../config/firebase'),
        ]);
        const slidesRef = collection(db, 'homeSlideshowImages');
        const slidesQuery = query(slidesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(slidesQuery);
        const fetched = snapshot.docs
          .map((doc) => (doc.data() as HomeSlide).url)
          .filter(Boolean);

        if (fetched.length > 0) {
          setHomeSlides(fetched);
        }
      } catch (error) {
        console.error('Error fetching home slideshow images:', error);
      }
    };

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const runFetch = () => {
      void fetchHomeSlides();
    };

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(runFetch, { timeout: 3000 });
    } else {
      timeoutId = setTimeout(runFetch, 800);
    }

    return () => {
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      document.querySelectorAll('.parallax').forEach((element) => {
        const speed = element.getAttribute('data-speed') || '0.5';
        const yPos = -(scrolled * parseFloat(speed));
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="home-page bs-page-bg">
      <section className="parallax-hero">
        <motion.div
          className="parallax-hero-image parallax glass-panel"
          data-speed="0.2"
          initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="parallax-hero-overlay">
            <motion.h1
              className="parallax-hero-title"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...revealTransition, delay: 0.15 }}
            >
              Bella Stone
            </motion.h1>
            <motion.p
              className="parallax-hero-slogan"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...revealTransition, delay: 0.3 }}
            >
              Where Elegance Meets Excellence
            </motion.p>
            <motion.p
              className="parallax-hero-location"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...revealTransition, delay: 0.42 }}
            >
              Fredonia, WI
            </motion.p>
          </div>
        </motion.div>
      </section>

      <motion.section
        className="quality-saying-section"
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        transition={revealTransition}
      >
        <div className="quality-saying-content glass-panel">
          <p className="quality-saying-text bs-body-text">
            Quality granite, quartz, and stone countertops crafted with the most modern methods,
            combining timeless elegance with cutting-edge precision. At Bella Stone, we transform your
            vision into reality through innovative fabrication techniques and meticulous attention to
            detail. Serving Milwaukee, Ozaukee County, Mequon, Port Washington, and nearby Wisconsin
            communities since 2008.
          </p>
          <div className="contact-us-button-container">
            <button
              className="glass-button contact-us-button"
              type="button"
              onClick={() => openQuoteInquiryWidget()}
            >
              Contact Us
            </button>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="slideshow-section"
        variants={revealVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        transition={{ ...revealTransition, delay: 0.05 }}
      >
        <div className="home-slideshow-wrapper">
          <ImageSlideshow images={homeSlides} />
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Home;
