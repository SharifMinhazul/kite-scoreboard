'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SlideContainerProps {
  url: string;
  isActive: boolean;
  title: string;
}

export function SlideContainer({ url, isActive, title }: SlideContainerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isActive, url]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div
      className={cn(
        'absolute inset-0 transition-opacity duration-500',
        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
      )}
    >
      {/* Loading state */}
      {isLoading && isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-20">
          <div className="text-center">
            <div className="electric-pulse w-4 h-4 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-sm font-display tracking-wider text-muted-foreground">
              LOADING {title}...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-20">
          <div className="text-center">
            <p className="text-lg font-display tracking-wider text-destructive mb-2">
              ERROR LOADING SLIDE
            </p>
            <p className="text-sm font-mono text-muted-foreground">
              {url}
            </p>
          </div>
        </div>
      )}

      {/* Iframe content */}
      <iframe
        src={`${url}?slideshow=true`}
        className="w-full h-full border-0"
        onLoad={handleLoad}
        onError={handleError}
        title={title}
      />
    </div>
  );
}
