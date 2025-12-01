import { useEffect, useRef, useState } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import './OurProcess.css';

interface ProcessImage {
  id: string;
  url: string;
  name: string;
  processStep: string;
}

interface EquipmentImage {
  url: string;
  name?: string;
}

const PROCESS_STEP_MAP: { [key: number]: string } = {
  1: 'design-consultation',
  2: 'precision-measuring',
  3: 'slab-selection',
  4: 'cnc-fabrication',
  5: 'quality-inspection',
  6: 'professional-installation',
};

const OurProcess = () => {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [processImages, setProcessImages] = useState<ProcessImage[]>([]);
  const [horusImage, setHorusImage] = useState<EquipmentImage | null>(null);
  const [sassoImage, setSassoImage] = useState<EquipmentImage | null>(null);

  useEffect(() => {
    fetchProcessImages();
    fetchHorusImage();
    fetchSassoImage();
  }, []);

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
      { threshold: 0.3 }
    );

    return () => {
      if (observerRef.current) {
        sectionsRef.current.forEach((section) => {
          if (section) observerRef.current?.unobserve(section);
        });
      }
    };
  }, []);

  const fetchProcessImages = async () => {
    try {
      const imagesRef = collection(db, 'processImages');
      const imagesQuery = query(imagesRef, orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(imagesQuery);
      
      const imagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProcessImage[];
      
      setProcessImages(imagesData);
    } catch (error) {
      console.error('Error fetching process images:', error);
    }
  };

  const fetchHorusImage = async () => {
    try {
      const horusDoc = await getDocs(collection(db, 'horusImage'));
      if (!horusDoc.empty) {
        const data = horusDoc.docs[0].data() as EquipmentImage;
        setHorusImage(data);
      }
    } catch (error) {
      console.error('Error fetching Horus image:', error);
    }
  };

  const fetchSassoImage = async () => {
    try {
      const sassoDoc = await getDocs(collection(db, 'sassoImage'));
      if (!sassoDoc.empty) {
        const data = sassoDoc.docs[0].data() as EquipmentImage;
        setSassoImage(data);
      }
    } catch (error) {
      console.error('Error fetching Sasso image:', error);
    }
  };

  const getImagesForStep = (stepNumber: number): ProcessImage[] => {
    const stepId = PROCESS_STEP_MAP[stepNumber];
    return processImages.filter(img => img.processStep === stepId);
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

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    }
  };

  return (
    <div className="our-process-page">
      {/* Parallax Hero Section */}
      <section className="process-parallax-hero">
        <div 
          className="process-parallax-hero-image parallax"
          data-speed="0.2"
          style={{
            backgroundImage: 'url(/9.webp)'
          }}
        >
          <div className="process-parallax-hero-overlay">
            <h1 className="process-parallax-hero-title">Our Process</h1>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="process-timeline-section" ref={addToRefs}>
        <div className="process-timeline-container">
          <h2 className="timeline-title">The Bella Stone Process</h2>
          
          <div className="timeline">
            <div className="timeline-item" ref={addToRefs}>
              <div className="timeline-marker">1</div>
              <div className="timeline-content">
                <h3>Design Consultation</h3>
                <p>
                  Collaborate with our experts to find the perfect stone solution that aligns 
                  with your vision and space requirements. We'll help you select the ideal 
                  material, color, and finish for your project.
                </p>
                <div className="timeline-image">
                  {getImagesForStep(1).length > 0 ? (
                    <img src={getImagesForStep(1)[0].url} alt={getImagesForStep(1)[0].name || "Design Consultation"} />
                  ) : (
                    <img src="/9.webp" alt="Design Consultation" />
                  )}
                </div>
              </div>
            </div>

            <div className="timeline-item" ref={addToRefs}>
              <div className="timeline-marker">2</div>
              <div className="timeline-content">
                <h3>Precision Measuring</h3>
                <p>
                  Our state-of-the-art laser measuring technology ensures a perfect fit for 
                  your countertops. We capture every detail to guarantee precise fabrication.
                </p>
                <div className="timeline-image">
                  {getImagesForStep(2).length > 0 ? (
                    <img src={getImagesForStep(2)[0].url} alt={getImagesForStep(2)[0].name || "Precision Measuring"} />
                  ) : (
                    <img src="/3.webp" alt="Precision Measuring" />
                  )}
                </div>
              </div>
            </div>

            <div className="timeline-item" ref={addToRefs}>
              <div className="timeline-marker">3</div>
              <div className="timeline-content">
                <h3>Slab Selection & Grain Matching</h3>
                <p>
                  Using our <strong>Horus slab scanner</strong> and <strong>Sasso K-600 miter saw</strong>, 
                  we ensure all slabs are properly grain matched. This advanced technology allows us 
                  to create seamless patterns and perfect alignment across multiple pieces, ensuring 
                  your countertops have a cohesive, natural flow.
                </p>
                <div className="timeline-image">
                  {getImagesForStep(3).length > 0 ? (
                    <img src={getImagesForStep(3)[0].url} alt={getImagesForStep(3)[0].name || "Slab Selection & Grain Matching"} />
                  ) : (
                    <img src="/6.webp" alt="Slab Selection & Grain Matching" />
                  )}
                </div>
              </div>
            </div>

            <div className="timeline-item" ref={addToRefs}>
              <div className="timeline-marker">4</div>
              <div className="timeline-content">
                <h3>CNC Fabrication</h3>
                <p>
                  Leveraging advanced CNC machinery, we guarantee intricate designs and superior 
                  finish quality for every countertop. Our precision cutting ensures perfect edges 
                  and seamless joints.
                </p>
                <div className="timeline-image">
                  {getImagesForStep(4).length > 0 ? (
                    <img src={getImagesForStep(4)[0].url} alt={getImagesForStep(4)[0].name || "CNC Fabrication"} />
                  ) : (
                    <img src="/7.webp" alt="CNC Fabrication" />
                  )}
                </div>
              </div>
            </div>

            <div className="timeline-item" ref={addToRefs}>
              <div className="timeline-marker">5</div>
              <div className="timeline-content">
                <h3>Quality Inspection</h3>
                <p>
                  Every piece undergoes rigorous quality inspection to ensure it meets our 
                  exacting standards before leaving our facility.
                </p>
                <div className="timeline-image">
                  {getImagesForStep(5).length > 0 ? (
                    <img src={getImagesForStep(5)[0].url} alt={getImagesForStep(5)[0].name || "Quality Inspection"} />
                  ) : (
                    <img src="/8.webp" alt="Quality Inspection" />
                  )}
                </div>
              </div>
            </div>

            <div className="timeline-item" ref={addToRefs}>
              <div className="timeline-marker">6</div>
              <div className="timeline-content">
                <h3>Professional Installation</h3>
                <p>
                  Expert installation by our skilled team ensures your countertops are perfectly 
                  placed and finished. We handle every detail from delivery to final polish.
                </p>
                <div className="timeline-image">
                  {getImagesForStep(6).length > 0 ? (
                    <img src={getImagesForStep(6)[0].url} alt={getImagesForStep(6)[0].name || "Professional Installation"} />
                  ) : (
                    <img src="/10.webp" alt="Professional Installation" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Highlight Section */}
      <section className="equipment-section" ref={addToRefs}>
        <div className="equipment-container">
          <h2 className="equipment-title">Precision Technology</h2>
          <div className="equipment-grid">
            <div className="equipment-item">
              <h3>Horus Slab Scanner</h3>
              <p>
                Our Horus slab scanner provides advanced digital imaging and analysis, allowing 
                us to create precise templates and ensure perfect grain matching across multiple 
                slabs. This technology eliminates guesswork and ensures seamless patterns.
              </p>
              <div className="equipment-image">
                {horusImage?.url ? (
                  <img src={horusImage.url} alt={horusImage.name || "Horus Slab Scanner"} onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/6.webp'; // Fallback image
                  }} />
                ) : (
                  <img src="/6.webp" alt="Horus Slab Scanner" />
                )}
              </div>
            </div>
            <div className="equipment-item">
              <h3>Sasso K-600 Miter Saw</h3>
              <p>
                The Sasso K-600 miter saw delivers precision cutting with perfect angles and 
                seamless joints. Combined with our grain matching technology, it ensures that 
                every cut maintains the natural flow and beauty of the stone.
              </p>
              <div className="equipment-image">
                {sassoImage?.url ? (
                  <img src={sassoImage.url} alt={sassoImage.name || "Sasso K-600 Miter Saw"} onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/7.webp'; // Fallback image
                  }} />
                ) : (
                  <img src="/7.webp" alt="Sasso K-600 Miter Saw" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurProcess;

