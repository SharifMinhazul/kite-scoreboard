'use client';

import { Button } from '@/components/ui/button';
import { Play, Pause, ChevronLeft, ChevronRight, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideControlsProps {
  current: number;
  total: number;
  isPaused: boolean;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onFullscreen: () => void;
  className?: string;
}

export function SlideControls({
  current,
  total,
  isPaused,
  onPause,
  onNext,
  onPrev,
  onFullscreen,
  className,
}: SlideControlsProps) {
  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'bg-card/90 backdrop-blur-sm border-2 border-primary/30',
        'rounded-lg px-6 py-3 flex items-center gap-4',
        'stripe-pattern',
        className
      )}
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary"></div>

      {/* Previous button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrev}
        className="hover:bg-primary/10 hover:text-primary"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      {/* Play/Pause button */}
      <Button
        variant={isPaused ? 'default' : 'secondary'}
        size="sm"
        onClick={onPause}
        className="font-display tracking-wider px-4"
      >
        {isPaused ? (
          <>
            <Play className="w-4 h-4 mr-2" />
            PLAY
          </>
        ) : (
          <>
            <Pause className="w-4 h-4 mr-2" />
            PAUSE
          </>
        )}
      </Button>

      {/* Next button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        className="hover:bg-primary/10 hover:text-primary"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Divider */}
      <div className="h-8 w-px bg-border"></div>

      {/* Slide counter */}
      <div className="text-sm font-display tracking-wider text-muted-foreground">
        {current + 1} / {total}
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-border"></div>

      {/* Fullscreen button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onFullscreen}
        className="hover:bg-primary/10 hover:text-primary"
      >
        <Maximize className="w-4 h-4" />
      </Button>
    </div>
  );
}
