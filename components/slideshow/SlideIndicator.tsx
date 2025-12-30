'use client';

import { cn } from '@/lib/utils';

interface SlideIndicatorProps {
  current: number;
  total: number;
  titles: string[];
  className?: string;
}

export function SlideIndicator({ current, total, titles, className }: SlideIndicatorProps) {
  return (
    <div className={cn('fixed top-6 left-6 z-50', className)}>
      <div className="bg-card/90 backdrop-blur-sm border-2 border-primary/30 rounded-lg px-4 py-3 stripe-pattern relative overflow-hidden">
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary"></div>

        {/* Current slide title */}
        <div className="mb-3">
          <div className="text-[10px] font-display tracking-widest text-muted-foreground mb-1">
            NOW SHOWING
          </div>
          <div className="text-sm font-display tracking-wider text-primary">
            {titles[current]}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: total }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === current
                  ? 'bg-primary w-6'
                  : index < current
                  ? 'bg-accent'
                  : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
