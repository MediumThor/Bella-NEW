import { useState, useEffect } from 'react';
import './ImageSlideshow.css';

interface ImageSlideshowProps {
  images: string[];
  title?: string;
}

const ImageSlideshow = ({ images, title }: ImageSlideshowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

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

  return (
    <div className="slideshow-container">
      {title && <h3 className="slideshow-title">{title}</h3>}
      <div className="slideshow-wrapper">
        <button className="slideshow-button prev" onClick={goToPrevious} aria-label="Previous image">
          ‹
        </button>
        <div className="slideshow">
          {images.map((image, index) => (
            <div
              key={index}
              className={`slide ${index === currentIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${image})` }}
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

