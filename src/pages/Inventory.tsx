import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import './Inventory.css';
import { FaExternalLinkAlt } from 'react-icons/fa';

interface InventoryImage {
  url: string;
  name?: string;
}

const Inventory = () => {
  const inventoryUrl = "https://fusiondrivecloud.com/inventory/?license=9cc0a1b333a11e8733fad9b8aa1aba8e";
  const [inventoryImage, setInventoryImage] = useState<InventoryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchInventoryImage();
  }, []);

  const fetchInventoryImage = async () => {
    try {
      const inventoryDoc = await getDocs(collection(db, 'inventoryImage'));
      if (!inventoryDoc.empty) {
        const data = inventoryDoc.docs[0].data() as InventoryImage;
        console.log('Fetched inventory image data:', data);
        if (data.url) {
          setInventoryImage(data);
        } else {
          console.warn('Inventory image data missing URL:', data);
        }
      } else {
        console.log('No inventory image found in Firestore');
      }
    } catch (error) {
      console.error('Error fetching inventory image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    console.error('Failed to load inventory image:', {
      attemptedUrl: img.src,
      inventoryImage: inventoryImage,
      error: e
    });
    setImageError(true);
  };

  // Determine which image to use
  const getImageSrc = () => {
    if (imageError) {
      return '/Taj';
    }
    if (inventoryImage?.url) {
      console.log('Using inventory image URL:', inventoryImage.url);
      return inventoryImage.url;
    }
    if (!loading) {
      // If we've finished loading and no image was found, use fallback
      console.log('No inventory image found, using fallback');
      return '/Taj';
    }
    // While loading, don't show anything yet
    return '';
  };

  const imageSrc = getImageSrc();
  const imageAlt = inventoryImage?.name || 'Bella Stone Inventory';

  return (
    <div className="inventory-page">
      <div className="inventory-container">
        <div className="inventory-note">
          <h2>Our Inventory</h2>
          <p>
            Many of our jobs are custom, our inventory changes often, and we are more than happy 
            to help design and order stone for custom projects outside our in-stock inventory. 
            Please contact us to discuss your specific needs.
          </p>
        </div>
        
        <div className="inventory-image-container">
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#EADAB6' }}>
              Loading inventory image...
            </div>
          ) : imageSrc ? (
            <img 
              src={imageSrc} 
              alt={imageAlt} 
              className="inventory-image"
              onError={handleImageError}
            />
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#EADAB6' }}>
              No inventory image available
            </div>
          )}
          <a 
            href={inventoryUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inventory-overlay-button"
          >
            <span>View Full Inventory</span>
            <FaExternalLinkAlt />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Inventory;

