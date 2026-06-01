import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type TouchEvent,
} from 'react';
import { createPortal } from 'react-dom';
import './ImageSlideshow.css';

interface ImageSlideshowProps {
  images: string[];
}

interface GalleryLightboxProps {
  images: string[];
  startIndex: number;
  onClose: () => void;
}

const SECONDS_PER_IMAGE = 4;
const SWIPE_THRESHOLD = 48;

const GalleryLightbox = ({ images, startIndex, onClose }: GalleryLightboxProps) => {
  const [index, setIndex] = useState(startIndex);
  const touchStartX = useRef(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = images.length;

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + count) % count);
  }, [count]);

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % count);
  }, [count]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') goPrev();
      if (event.key === 'ArrowRight') goNext();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev, onClose]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? 0;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    if (!touch) return;

    const delta = touch.clientX - touchStartX.current;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;

    if (delta < 0) goNext();
    else goPrev();
  };

  return createPortal(
    <div
      className="gallery-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery"
    >
      <button
        type="button"
        className="gallery-lightbox__backdrop"
        onClick={onClose}
        aria-label="Close gallery"
      />

      <div
        className="gallery-lightbox__panel"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          ref={closeRef}
          type="button"
          className="gallery-lightbox__close"
          onClick={onClose}
          aria-label="Close gallery"
        >
          ×
        </button>

        {count > 1 && (
          <button
            type="button"
            className="gallery-lightbox__nav gallery-lightbox__nav--prev"
            onClick={goPrev}
            aria-label="Previous image"
          >
            ‹
          </button>
        )}

        <figure className="gallery-lightbox__figure">
          <img
            className="gallery-lightbox__img"
            src={images[index]}
            alt=""
            decoding="async"
            draggable={false}
          />
          <figcaption className="gallery-lightbox__counter">
            {index + 1} / {count}
          </figcaption>
        </figure>

        {count > 1 && (
          <button
            type="button"
            className="gallery-lightbox__nav gallery-lightbox__nav--next"
            onClick={goNext}
            aria-label="Next image"
          >
            ›
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

const ImageSlideshow = ({ images }: ImageSlideshowProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (images.length === 0) return null;

  const loop = [...images, ...images];
  const scrollDuration = images.length * SECONDS_PER_IMAGE;

  const openLightbox = (itemIndex: number) => {
    setLightboxIndex(itemIndex % images.length);
  };

  return (
    <>
      <div className="image-slideshow" ref={containerRef} aria-label="Project images">
        <div className="image-slideshow__frame glass-panel glass-panel--elevated">
          <div
            className={`image-slideshow__track${isVisible ? ' is-scrolling' : ''}`}
            style={{ '--scroll-duration': `${scrollDuration}s` } as CSSProperties}
          >
            {loop.map((src, index) => {
              const imageIndex = index % images.length;

              return (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  className="image-slideshow__item"
                  onClick={() => openLightbox(imageIndex)}
                  aria-label={`View image ${imageIndex + 1} of ${images.length}`}
                >
                  <img
                    src={src}
                    alt=""
                    loading={index < 2 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : undefined}
                    decoding="async"
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
};

export default ImageSlideshow;
