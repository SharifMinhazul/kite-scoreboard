'use client';

import { cn } from '@/lib/utils';

interface SlideContainerProps {
  url: string;
  isActive: boolean;
  title: string;
}

export function SlideContainer({ url, isActive, title }: SlideContainerProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 transition-opacity duration-500',
        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
      )}
    >
      {/* Iframe content */}
      <iframe
        src={`${url}?slideshow=true`}
        className="w-full h-full border-0"
        title={title}
        allow="fullscreen"
      />
    </div>
  );
}
