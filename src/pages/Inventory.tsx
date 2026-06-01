import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { motion, useReducedMotion } from 'motion/react';
import { FaPhone, FaEnvelope } from 'react-icons/fa';
import InventoryWidget from '../components/InventoryWidget';
import { db } from '../config/firebase';
import './Inventory.css';

const BS_EASE = [0.22, 1, 0.36, 1] as const;
const HERO_FALLBACK = '/6.webp';

interface InventoryHeroImage {
  url: string;
  name?: string;
}

const Inventory = () => {
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'inventoryImage'));
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data() as InventoryHeroImage;
          if (data.url) {
            setHeroUrl(data.url);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching inventory hero image:', error);
      }
      setHeroUrl(HERO_FALLBACK);
    };

    void fetchHeroImage();
  }, []);

  return (
    <div className="inventory-page bs-page-bg">
      <section className="bs-inventory-hero">
        <motion.div
          className="bs-inventory-hero__frame"
          style={heroUrl ? { backgroundImage: `url(${heroUrl})` } : undefined}
          initial={reduceMotion ? false : { opacity: 0, scale: 1.03 }}
          animate={{ opacity: heroUrl ? 1 : 0, scale: 1 }}
          transition={{ duration: 0.85, ease: BS_EASE }}
        >
          <div className="bs-inventory-hero__overlay">
            <motion.p
              className="bs-inventory-hero__kicker"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: BS_EASE, delay: 0.1 }}
            >
              Live slab catalog
            </motion.p>
            <motion.h1
              className="bs-inventory-hero__title"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: BS_EASE, delay: 0.18 }}
            >
              Our Inventory
            </motion.h1>
            <motion.p
              className="bs-inventory-hero__body bs-body-text"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: BS_EASE, delay: 0.28 }}
            >
              Many of our jobs are custom, our inventory changes often, and we are more than happy to
              help design and order stone for projects outside our in-stock selection. Browse what we
              have on hand below, or contact us to discuss your specific needs.
            </motion.p>
            <motion.div
              className="bs-inventory-hero__actions"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: BS_EASE, delay: 0.38 }}
            >
              <a href="tel:+1-414-617-8078" className="bs-inventory-contact-link">
                <FaPhone size="1.1rem" />
                <span>414-617-8078</span>
              </a>
              <a href="mailto:bellastone@live.com" className="bs-inventory-contact-link">
                <FaEnvelope size="1.1rem" />
                <span>bellastone@live.com</span>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <motion.section
        className="bs-inventory-widget-section glass-panel glass-panel--elevated"
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.85, ease: BS_EASE, delay: 0.05 }}
      >
        <div className="bs-inventory-widget-section__header">
          <p className="bs-inventory-widget-section__kicker">In stock now</p>
          <p className="bs-inventory-widget-section__hint">Scroll inside the catalog to explore</p>
        </div>
        <div id="in-stock-slabs" className="inventory-widget-mount" />
      </motion.section>

      <InventoryWidget />
    </div>
  );
};

export default Inventory;
