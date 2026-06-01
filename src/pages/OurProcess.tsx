import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
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

interface ProcessStep {
  step: number;
  stepId: string;
  title: string;
  description: ReactNode;
  fallbackImage: string;
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    stepId: 'design-consultation',
    title: 'Design Consultation',
    description:
      'Collaborate with our experts to find the perfect stone solution that aligns with your vision and space requirements. We help you select the ideal material, color, and finish for your project.',
    fallbackImage: '/9.webp',
  },
  {
    step: 2,
    stepId: 'precision-measuring',
    title: 'Precision Measuring',
    description:
      'Our state-of-the-art laser measuring technology ensures a perfect fit for your countertops. We capture every detail to guarantee precise fabrication.',
    fallbackImage: '/3.webp',
  },
  {
    step: 3,
    stepId: 'slab-selection',
    title: 'Slab Selection & Grain Matching',
    description: (
      <>
        Using our <strong>Horus slab scanner</strong> and <strong>Sasso K-600 miter saw</strong>, we
        ensure all slabs are properly grain matched. This advanced technology allows us to create
        seamless patterns and perfect alignment across multiple pieces.
      </>
    ),
    fallbackImage: '/6.webp',
  },
  {
    step: 4,
    stepId: 'cnc-fabrication',
    title: 'CNC Fabrication',
    description:
      'Leveraging advanced CNC machinery, we guarantee intricate designs and superior finish quality for every countertop. Our precision cutting ensures perfect edges and seamless joints.',
    fallbackImage: '/7.webp',
  },
  {
    step: 5,
    stepId: 'quality-inspection',
    title: 'Quality Inspection',
    description:
      'Every piece undergoes rigorous quality inspection to ensure it meets our exacting standards before leaving our facility.',
    fallbackImage: '/8.webp',
  },
  {
    step: 6,
    stepId: 'professional-installation',
    title: 'Professional Installation',
    description:
      'Expert installation by our skilled team ensures your countertops are perfectly placed and finished. We handle every detail from delivery to final polish.',
    fallbackImage: '/10.webp',
  },
];

const BS_EASE = [0.22, 1, 0.36, 1] as const;

const scrollStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.06 } },
};

const scrollRise = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: BS_EASE } },
};

const OurProcess = () => {
  const [processImages, setProcessImages] = useState<ProcessImage[]>([]);
  const [processImagesLoaded, setProcessImagesLoaded] = useState(false);
  const [horusImage, setHorusImage] = useState<EquipmentImage | null>(null);
  const [sassoImage, setSassoImage] = useState<EquipmentImage | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const timelineRef = useRef<HTMLOListElement>(null);
  const previewColumnRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);
  const [previewStyle, setPreviewStyle] = useState<CSSProperties>({});
  const [previewPlaceholderHeight, setPreviewPlaceholderHeight] = useState(0);

  const updateActiveFromScroll = useCallback(() => {
    if (isHoveringRef.current) return;

    const stepElements = stepRefs.current.filter(Boolean) as HTMLLIElement[];
    if (stepElements.length === 0) return;

    const viewportCenter = window.innerHeight * 0.42;
    let closestIndex = 0;
    let closestDistance = Infinity;

    stepElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const stepCenter = rect.top + rect.height / 2;
      const distance = Math.abs(stepCenter - viewportCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveStepIndex(closestIndex);
  }, []);

  const staggerProps = reduceMotion
    ? {}
    : ({
        initial: 'hidden',
        whileInView: 'show',
        viewport: { once: true, amount: 0.15 },
      } as const);

  useEffect(() => {
    const fetchProcessImages = async () => {
      try {
        const imagesRef = collection(db, 'processImages');
        const imagesQuery = query(imagesRef, orderBy('uploadedAt', 'desc'));
        const querySnapshot = await getDocs(imagesQuery);
        const imagesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ProcessImage[];
        setProcessImages(imagesData);
      } catch (error) {
        console.error('Error fetching process images:', error);
      } finally {
        setProcessImagesLoaded(true);
      }
    };

    const fetchHorusImage = async () => {
      try {
        const horusDoc = await getDocs(collection(db, 'horusImage'));
        if (!horusDoc.empty) {
          setHorusImage(horusDoc.docs[0].data() as EquipmentImage);
        }
      } catch (error) {
        console.error('Error fetching Horus image:', error);
      }
    };

    const fetchSassoImage = async () => {
      try {
        const sassoDoc = await getDocs(collection(db, 'sassoImage'));
        if (!sassoDoc.empty) {
          setSassoImage(sassoDoc.docs[0].data() as EquipmentImage);
        }
      } catch (error) {
        console.error('Error fetching Sasso image:', error);
      }
    };

    fetchProcessImages();
    fetchHorusImage();
    fetchSassoImage();
  }, []);

  useEffect(() => {
    const timeline = timelineRef.current;
    const previewColumn = previewColumnRef.current;
    if (!timeline || !previewColumn) return;

    const syncPreviewColumnHeight = () => {
      previewColumn.style.minHeight = `${timeline.offsetHeight}px`;
    };

    syncPreviewColumnHeight();

    const observer = new ResizeObserver(syncPreviewColumnHeight);
    observer.observe(timeline);

    return () => observer.disconnect();
  }, []);

  const updatePreviewPosition = useCallback(() => {
    const column = previewColumnRef.current;
    const preview = previewRef.current;
    const lastStep = stepRefs.current[PROCESS_STEPS.length - 1];

    if (!column || !preview || !lastStep) return;

    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    if (!isDesktop) {
      setPreviewStyle({});
      setPreviewPlaceholderHeight(0);
      return;
    }

    const navHeight =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--bs-nav-height')
      ) || 110;
    const stickyTop = navHeight + 12;
    const previewHeight = preview.offsetHeight;
    const columnRect = column.getBoundingClientRect();
    const lastStepBottom = lastStep.getBoundingClientRect().bottom;
    const bottomLimit = lastStepBottom - previewHeight;

    setPreviewPlaceholderHeight(previewHeight);

    if (columnRect.top > stickyTop) {
      setPreviewStyle({});
      return;
    }

    if (stickyTop >= bottomLimit) {
      const columnTop = columnRect.top + window.scrollY;
      const lastStepBottomDoc = lastStep.getBoundingClientRect().bottom + window.scrollY;
      setPreviewStyle({
        position: 'absolute',
        top: `${lastStepBottomDoc - columnTop - previewHeight}px`,
        left: 0,
        width: '100%',
      });
      return;
    }

    setPreviewStyle({
      position: 'fixed',
      top: `${stickyTop}px`,
      left: `${columnRect.left}px`,
      width: `${columnRect.width}px`,
      zIndex: 50,
    });
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateActiveFromScroll();
        updatePreviewPosition();
        ticking = false;
      });
    };

    const syncAll = () => {
      updateActiveFromScroll();
      updatePreviewPosition();
    };

    syncAll();
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    const timeline = timelineRef.current;
    const preview = previewRef.current;
    const observer = new ResizeObserver(onScrollOrResize);
    if (timeline) observer.observe(timeline);
    if (preview) observer.observe(preview);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      observer.disconnect();
    };
  }, [updateActiveFromScroll, updatePreviewPosition]);

  const getImageForStep = (step: ProcessStep): { src: string; alt: string } => {
    const match = processImages.find((img) => img.processStep === step.stepId);
    if (match) {
      return { src: match.url, alt: match.name || step.title };
    }
    return { src: step.fallbackImage, alt: step.title };
  };

  const activeStep = PROCESS_STEPS[activeStepIndex];
  const activePreview = getImageForStep(activeStep);

  return (
    <div className="our-process-page bs-page-bg">
      <section className="bs-process-hero">
        <motion.div
          className="bs-process-hero__frame glass-panel"
          style={{ backgroundImage: 'url(/9.webp)' }}
          initial={reduceMotion ? false : { opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, ease: BS_EASE }}
        >
          <div className="bs-process-hero__overlay">
            <motion.p
              className="bs-process-hero__kicker"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: BS_EASE, delay: 0.1 }}
            >
              Crafted with precision
            </motion.p>
            <motion.h1
              className="bs-process-hero__title"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: BS_EASE, delay: 0.18 }}
            >
              Our Process
            </motion.h1>
            <motion.p
              className="bs-process-hero__subtitle bs-body-text"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: BS_EASE, delay: 0.28 }}
            >
              From first consultation to final installation — six deliberate steps that protect
              your vision and your investment.
            </motion.p>
          </div>
        </motion.div>
      </section>

      <section className="bs-process-timeline-section">
        <motion.div
          className="bs-process-timeline-header"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: BS_EASE }}
        >
          <h2 className="bs-section-title">The Bella Stone Process</h2>
        </motion.div>

        <div
          className="bs-process-wrap"
          onMouseLeave={() => {
            isHoveringRef.current = false;
            updateActiveFromScroll();
          }}
        >
          <motion.ol
            ref={timelineRef}
            className="bs-process-timeline"
            aria-label="Bella Stone fabrication process"
            variants={scrollStagger}
            {...staggerProps}
          >
            <div className="bs-process-timeline__rail" aria-hidden="true" />
            <div
              className="bs-process-timeline__rail bs-process-timeline__rail--progress"
              aria-hidden="true"
            />

            {PROCESS_STEPS.map((step, index) => {
              const isActive = activeStepIndex === index;
              const stepPreview = getImageForStep(step);

              return (
                <motion.li
                  key={step.stepId}
                  ref={(element) => {
                    stepRefs.current[index] = element;
                  }}
                  className={`bs-process-timeline__step${isActive ? ' is-active' : ''}`}
                  variants={scrollRise}
                >
                  <div className="bs-process-timeline__station" aria-hidden="true">
                    <span className="bs-process-timeline__station-ring" />
                    <span className="bs-process-timeline__station-num">{step.step}</span>
                  </div>
                  <div
                    className={`bs-process-timeline__card glass-panel${isActive ? ' is-active' : ''}`}
                    onMouseEnter={() => {
                      isHoveringRef.current = true;
                      setActiveStepIndex(index);
                    }}
                    onFocus={() => {
                      isHoveringRef.current = true;
                      setActiveStepIndex(index);
                    }}
                    onBlur={() => {
                      isHoveringRef.current = false;
                      updateActiveFromScroll();
                    }}
                    onClick={() => setActiveStepIndex(index)}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isActive}
                    aria-label={`${step.title}. Preview step photo.`}
                  >
                    <div className="bs-process-timeline__kicker">
                      Step {String(step.step).padStart(2, '0')}
                    </div>
                    <h3 className="bs-process-timeline__title">{step.title}</h3>
                    <p className="bs-process-timeline__desc">{step.description}</p>
                    <div className="bs-process-timeline__mobile-preview">
                      {processImagesLoaded && (
                        <img
                          src={stepPreview.src}
                          alt={stepPreview.alt}
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ol>

          <div className="bs-process-preview-column" ref={previewColumnRef}>
            <div
              className="bs-process-preview-sticky"
              style={
                previewPlaceholderHeight > 0
                  ? { minHeight: previewPlaceholderHeight }
                  : undefined
              }
            >
              <div
                ref={previewRef}
                className="bs-process-preview glass-panel glass-panel--elevated"
                style={previewStyle}
                aria-live="polite"
                aria-label={`Preview: ${activeStep.title}`}
              >
                <div className="bs-process-preview__bar" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="bs-process-preview__visual">
                  <AnimatePresence mode="wait" initial={false}>
                    {processImagesLoaded && (
                      <motion.img
                        key={activePreview.src}
                        className="bs-process-preview__shot"
                        src={activePreview.src}
                        alt={activePreview.alt}
                        initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.32, ease: BS_EASE }}
                        loading="lazy"
                        decoding="async"
                        onLoad={updatePreviewPosition}
                      />
                    )}
                  </AnimatePresence>
                </div>
                <p className="bs-process-preview__caption">{activeStep.title}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bs-process-equipment-section">
        <motion.div
          className="bs-process-equipment-header"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, ease: BS_EASE }}
        >
          <p className="bs-process-section-kicker">Technology</p>
          <h2 className="bs-section-title">Precision Technology</h2>
        </motion.div>

        <motion.div
          className="bs-process-equipment-grid"
          variants={scrollStagger}
          {...staggerProps}
        >
          {[
            {
              title: 'Horus Slab Scanner',
              body: 'Our Horus slab scanner provides advanced digital imaging and analysis, allowing us to create precise templates and ensure perfect grain matching across multiple slabs.',
              image: horusImage?.url,
              fallback: '/6.webp',
              alt: horusImage?.name || 'Horus Slab Scanner',
            },
            {
              title: 'Sasso K-600 Miter Saw',
              body: 'The Sasso K-600 miter saw delivers precision cutting with perfect angles and seamless joints — maintaining the natural flow and beauty of the stone.',
              image: sassoImage?.url,
              fallback: '/7.webp',
              alt: sassoImage?.name || 'Sasso K-600 Miter Saw',
            },
          ].map((item) => (
            <motion.article
              key={item.title}
              className="bs-process-equipment-card glass-panel"
              variants={scrollRise}
              whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
            >
              <div className="bs-process-equipment-card__copy">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
              <div className="bs-process-equipment-card__visual">
                <img
                  src={item.image || item.fallback}
                  alt={item.alt}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = item.fallback;
                  }}
                />
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>
    </div>
  );
};

export default OurProcess;
