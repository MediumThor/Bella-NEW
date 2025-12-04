import { useState, useEffect } from 'react';
import './ImageSlideshow.css';

interface ImageSlideshowProps {
  images: string[];
  title?: string;
}

const ImageSlideshow = ({ images, title }: ImageSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Preload current, next, and previous images
  useEffect(() => {
    const imagesToLoad = new Set<number>();
    imagesToLoad.add(currentIndex);
    imagesToLoad.add((currentIndex + 1) % images.length);
    imagesToLoad.add((currentIndex - 1 + images.length) % images.length);

    imagesToLoad.forEach((index) => {
      if (!loadedImages.has(index)) {
        const img = new Image();
        img.src = images[index];
        img.onload = () => {
          setLoadedImages((prev) => new Set(prev).add(index));
        };
      }
    });
  }, [currentIndex, images, loadedImages]);

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
    <div className="slideshow-container">
      {title && <h3 className="slideshow-title">{title}</h3>}
      <div className="slideshow-wrapper">
        <button className="slideshow-button prev" onClick={goToPrevious} aria-label="Previous image">
          ‹
        </button>
        <div className="slideshow">
          {getVisibleSlides().map((index) => (
            <div
              key={index}
              className={`slide ${index === currentIndex ? 'active' : ''}`}
              style={{ 
                backgroundImage: loadedImages.has(index) ? `url(${images[index]})` : 'none',
                display: index === currentIndex ? 'block' : 'none'
              }}
            />
          ))}
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

