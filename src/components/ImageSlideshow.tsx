import { useState, useEffect, useRef } from 'react';
import './ImageSlideshow.css';

interface ImageSlideshowProps {
  images: string[];
  title?: string;
}

const ImageSlideshow = ({ images, title }: ImageSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to only load images when slideshow is visible
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Preload current, next, and previous images only when visible
  useEffect(() => {
    if (!isVisible || images.length === 0) return;

    const imagesToLoad = new Set<number>();
    imagesToLoad.add(currentIndex);
    imagesToLoad.add((currentIndex + 1) % images.length);
    imagesToLoad.add((currentIndex - 1 + images.length) % images.length);

    imagesToLoad.forEach((index) => {
      if (!loadedImages.has(index) && images[index]) {
        const img = new Image();
        img.loading = 'lazy';
        img.src = images[index];
        img.onload = () => {
          setLoadedImages((prev) => new Set(prev).add(index));
        };
        img.onerror = () => {
          console.error(`Failed to load image at index ${index}`);
        };
      }
    });
  }, [currentIndex, images, loadedImages, isVisible]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length, isPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsPlaying(false);
  };

  // Only render current slide and preload adjacent ones
  const getVisibleSlides = () => {
    const visible = new Set<number>();
    visible.add(currentIndex);
    visible.add((currentIndex + 1) % images.length);
    visible.add((currentIndex - 1 + images.length) % images.length);
    return Array.from(visible);
  };

  return (
    <div className="slideshow-container" ref={containerRef}>
      {title && <h3 className="slideshow-title">{title}</h3>}
      <div className="slideshow-wrapper">
        <button className="slideshow-button prev" onClick={goToPrevious} aria-label="Previous image">
          ‹
        </button>
        <div className="slideshow">
          {getVisibleSlides().map((index) => (
            <div
              key={index}
              className={`slide ${index === currentIndex ? 'active' : ''} ${loadedImages.has(index) ? 'loaded' : 'loading'}`}
              style={{ 
                backgroundImage: loadedImages.has(index) ? `url(${images[index]})` : 'none',
                display: index === currentIndex ? 'block' : 'none'
              }}
            />
          ))}
          {!loadedImages.has(currentIndex) && (
            <div className="slide-loading-placeholder">
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>
        <button className="slideshow-button next" onClick={goToNext} aria-label="Next image">
          ›
        </button>
        <div className="slideshow-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      <div className="slideshow-counter">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default ImageSlideshow;

