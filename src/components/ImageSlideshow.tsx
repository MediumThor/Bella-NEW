import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const viewportRef = useRef<HTMLDivElement>(null);
  const autoplayTimerRef = useRef<number | null>(null);
  const lastInteractionAtRef = useRef<number>(0);

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

  const slideCount = images.length;

  const normalizedIndex = useMemo(() => {
    if (slideCount <= 0) return 0;
    return ((currentIndex % slideCount) + slideCount) % slideCount;
  }, [currentIndex, slideCount]);

  // Preload current, next, and previous images only when visible
  useEffect(() => {
    if (!isVisible || slideCount === 0) return;

    const imagesToLoad = new Set<number>();
    imagesToLoad.add(normalizedIndex);
    imagesToLoad.add((normalizedIndex + 1) % slideCount);
    imagesToLoad.add((normalizedIndex - 1 + slideCount) % slideCount);

    imagesToLoad.forEach((index) => {
      if (!loadedImages.has(index) && images[index]) {
        const img = new Image();
        img.src = images[index];
        img.onload = () => {
          setLoadedImages((prev) => new Set(prev).add(index));
        };
        img.onerror = () => {
          console.error(`Failed to load image at index ${index}`);
        };
      }
    });
  }, [images, isVisible, loadedImages, normalizedIndex, slideCount]);

  const pause = useCallback(() => {
    lastInteractionAtRef.current = Date.now();
    setIsPlaying(false);
  }, []);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'smooth') => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const width = viewport.clientWidth;
      if (width <= 0) return;

      const nextIndex = slideCount <= 0 ? 0 : ((index % slideCount) + slideCount) % slideCount;
      viewport.scrollTo({ left: nextIndex * width, behavior });
    },
    [slideCount]
  );

  const goToSlide = useCallback(
    (index: number) => {
      pause();
      setCurrentIndex(index);
      scrollToIndex(index, 'smooth');
    },
    [pause, scrollToIndex]
  );

  const goToPrevious = useCallback(() => {
    pause();
    const next = normalizedIndex - 1;
    setCurrentIndex(next);
    scrollToIndex(next, 'smooth');
  }, [normalizedIndex, pause, scrollToIndex]);

  const goToNext = useCallback(() => {
    pause();
    const next = normalizedIndex + 1;
    setCurrentIndex(next);
    scrollToIndex(next, 'smooth');
  }, [normalizedIndex, pause, scrollToIndex]);

  // Keep scroll position aligned to current slide (initial + resize)
  useEffect(() => {
    if (slideCount === 0) return;
    // No smooth on first paint / resize reflow
    scrollToIndex(normalizedIndex, 'auto');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideCount]);

  useEffect(() => {
    if (slideCount === 0) return;
    const handleResize = () => scrollToIndex(normalizedIndex, 'auto');
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [normalizedIndex, scrollToIndex, slideCount]);

  // Autoplay (only when visible + more than 1 slide)
  useEffect(() => {
    if (!isVisible || !isPlaying) return;
    if (slideCount <= 1) return;

    if (autoplayTimerRef.current) {
      window.clearInterval(autoplayTimerRef.current);
    }

    autoplayTimerRef.current = window.setInterval(() => {
      // If user just interacted, don't immediately “fight back”
      if (Date.now() - lastInteractionAtRef.current < 4000) return;
      const next = normalizedIndex + 1;
      setCurrentIndex(next);
      scrollToIndex(next, 'smooth');
    }, 5500);

    return () => {
      if (autoplayTimerRef.current) {
        window.clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };
  }, [isPlaying, isVisible, normalizedIndex, scrollToIndex, slideCount]);

  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const width = viewport.clientWidth;
    if (width <= 0) return;
    const nextIndex = Math.round(viewport.scrollLeft / width);
    if (nextIndex !== normalizedIndex) {
      setCurrentIndex(nextIndex);
    }
  }, [normalizedIndex]);

  const handlePointerDown = useCallback(() => {
    // any touch / drag should pause autoplay
    pause();
  }, [pause]);

  if (slideCount === 0) return null;

  return (
    <div
      className="image-slideshow"
      ref={containerRef}
      aria-roledescription="carousel"
      aria-label={title ?? 'Image carousel'}
      onPointerDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onWheel={pause}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
      }}
      tabIndex={0}
    >
      {title && <h3 className="image-slideshow__title">{title}</h3>}
      <div className="image-slideshow__frame">
        <button
          className="image-slideshow__nav image-slideshow__nav--prev"
          onClick={goToPrevious}
          aria-label="Previous image"
          type="button"
        >
          ‹
        </button>

        <div
          className="image-slideshow__viewport"
          ref={viewportRef}
          onScroll={handleScroll}
        >
          {images.map((src, index) => {
            const isLoaded = loadedImages.has(index);
            const isActive = index === normalizedIndex;
            return (
              <div
                key={`${src}-${index}`}
                className="image-slideshow__slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slideCount}`}
              >
                {!isLoaded && (
                  <div className="image-slideshow__loading" aria-hidden="true">
                    <div className="image-slideshow__spinner" />
                  </div>
                )}
                <img
                  className={`image-slideshow__img ${isLoaded ? 'is-loaded' : 'is-loading'}`}
                  src={src}
                  alt=""
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                  style={{ opacity: isLoaded ? 1 : 0 }}
                />
                {isActive && (
                  <div className="image-slideshow__sheen" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>

        <button
          className="image-slideshow__nav image-slideshow__nav--next"
          onClick={goToNext}
          aria-label="Next image"
          type="button"
        >
          ›
        </button>

        <div className="image-slideshow__indicators" aria-label="Choose slide">
          {images.map((_, index) => (
            <button
              key={index}
              className={`image-slideshow__dot ${index === normalizedIndex ? 'is-active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === normalizedIndex ? 'true' : undefined}
              type="button"
            />
          ))}
        </div>
      </div>

      <div className="image-slideshow__counter" aria-live="polite">
        {normalizedIndex + 1} / {slideCount}
      </div>
    </div>
  );
};

export default ImageSlideshow;

