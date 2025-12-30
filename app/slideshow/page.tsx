'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlideContainer } from '@/components/slideshow/SlideContainer';
import { SlideControls } from '@/components/slideshow/SlideControls';
import { SlideIndicator } from '@/components/slideshow/SlideIndicator';
import { SLIDESHOW_SLIDES, SLIDESHOW_PRESETS } from '@/config/slideshow';

function SlideshowContent() {
  const searchParams = useSearchParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [mouseMoving, setMouseMoving] = useState(false);

  // Get configuration from URL params
  const durationParam = searchParams.get('duration');
  const presetParam = searchParams.get('preset') as keyof typeof SLIDESHOW_PRESETS | null;
  const autoplayParam = searchParams.get('autoplay');

  // Calculate slide duration
  const getDefaultDuration = () => {
    if (durationParam) return parseInt(durationParam);
    if (presetParam && SLIDESHOW_PRESETS[presetParam]) {
      return SLIDESHOW_PRESETS[presetParam];
    }
    return SLIDESHOW_SLIDES[currentSlide].duration;
  };

  const defaultDuration = getDefaultDuration();

  // Auto-start based on URL param
  useEffect(() => {
    if (autoplayParam === 'false') {
      setIsPaused(true);
    }
  }, [autoplayParam]);

  // Auto-advance logic
  useEffect(() => {
    if (isPaused) return;

    const duration = durationParam
      ? defaultDuration * 1000
      : SLIDESHOW_SLIDES[currentSlide].duration * 1000;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDESHOW_SLIDES.length);
    }, duration);

    return () => clearInterval(timer);
  }, [currentSlide, isPaused, durationParam, defaultDuration]);

  // Auto-hide controls on mouse inactivity
  useEffect(() => {
    let hideTimer: NodeJS.Timeout;

    if (mouseMoving) {
      setShowControls(true);
      hideTimer = setTimeout(() => {
        setShowControls(false);
        setMouseMoving(false);
      }, 3000);
    }

    return () => clearTimeout(hideTimer);
  }, [mouseMoving]);

  // Mouse move handler
  const handleMouseMove = useCallback(() => {
    setMouseMoving(true);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPaused((prev) => !prev);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentSlide((prev) => (prev + 1) % SLIDESHOW_SLIDES.length);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentSlide((prev) => (prev - 1 + SLIDESHOW_SLIDES.length) % SLIDESHOW_SLIDES.length);
          break;
        case 'f':
          e.preventDefault();
          handleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-background"
      onMouseMove={handleMouseMove}
    >
      {/* Render all slides */}
      {SLIDESHOW_SLIDES.map((slide, index) => (
        <SlideContainer
          key={slide.url}
          url={slide.url}
          title={slide.title}
          isActive={index === currentSlide}
        />
      ))}

      {/* Slide indicator */}
      <SlideIndicator
        current={currentSlide}
        total={SLIDESHOW_SLIDES.length}
        titles={SLIDESHOW_SLIDES.map((s) => s.title)}
        className={showControls ? 'opacity-100' : 'opacity-0'}
      />

      {/* Controls */}
      <SlideControls
        current={currentSlide}
        total={SLIDESHOW_SLIDES.length}
        isPaused={isPaused}
        onPause={() => setIsPaused(!isPaused)}
        onNext={() => setCurrentSlide((prev) => (prev + 1) % SLIDESHOW_SLIDES.length)}
        onPrev={() => setCurrentSlide((prev) => (prev - 1 + SLIDESHOW_SLIDES.length) % SLIDESHOW_SLIDES.length)}
        onFullscreen={handleFullscreen}
        className={showControls ? 'opacity-100' : 'opacity-0'}
      />

      {/* Keyboard shortcuts hint */}
      {showControls && (
        <div className="fixed bottom-6 right-6 z-50 bg-card/90 backdrop-blur-sm border border-border rounded px-3 py-2">
          <div className="text-[10px] font-mono text-muted-foreground space-y-1">
            <div><kbd className="text-primary">SPACE</kbd> Play/Pause</div>
            <div><kbd className="text-primary">←/→</kbd> Navigate</div>
            <div><kbd className="text-primary">F</kbd> Fullscreen</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SlideshowPage() {
  return (
    <Suspense fallback={
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-xl font-display tracking-wider text-primary animate-pulse">
            LOADING SLIDESHOW...
          </div>
        </div>
      </div>
    }>
      <SlideshowContent />
    </Suspense>
  );
}
