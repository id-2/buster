import { useMemoizedFn } from 'ahooks';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';

export type UseAutoScrollProps = {
  enabled?: boolean;
};

export function useAutoScroll({ enabled = true }: UseAutoScrollProps = {}) {
  // Store container element in state so that we can
  // mount/dismount handlers via `useEffect` (see below)
  const [container, setContainer] = useState<HTMLDivElement>();

  const scroller = useMemo(() => {
    if (container) {
      return new SmoothScroller(container);
    }
  }, [container]);

  // Maintain `isSticky` state for the consumer to access
  const [isSticky, setIsSticky] = useState(true);

  // Maintain `isStickyRef` value for internal use
  // that isn't limited to React's state lifecycle
  const isStickyRef = useRef(isSticky);

  const ref = useMemoizedFn((element: HTMLDivElement | null) => {
    if (element) {
      setContainer(element);
    }
  });

  // Convenience function to allow consumers to
  // scroll to the bottom of the container
  const scrollToEnd = useMemoizedFn(() => {
    if (container && scroller) {
      isStickyRef.current = true;

      // Update state so that consumers can hook into sticky status
      setIsSticky(isStickyRef.current);

      // TODO: support duration greater than 0
      scroller.scrollTo(container.scrollHeight - container.clientHeight, 50);
    }
  });

  useEffect(() => {
    let resizeObserver: ResizeObserver | undefined;
    let mutationObserver: MutationObserver | undefined;
    let lastScrollTop: number;
    let lastScrollHeight: number;

    function onScrollStart(e: Event) {
      if (container && scroller) {
        // TODO: understand where these phantom scroll/height changes occur
        if (lastScrollHeight !== undefined && container.scrollHeight !== lastScrollHeight) {
          return;
        }

        const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight;
        const hasScrolledUp = container.scrollTop < lastScrollTop;

        if (hasScrolledUp) {
          scroller.cancel();
        }

        // We're sticky if we're in the middle of an automated scroll
        // or if the user manually scrolled to the bottom
        isStickyRef.current = !hasScrolledUp && (scroller.isAnimating || isAtBottom);

        // Update state so that consumers can hook into sticky status
        setIsSticky(isStickyRef.current);
      }
    }

    if (container) {
      container.addEventListener('scroll', onScrollStart);

      if (enabled) {
        // Scroll when the container's children resize
        resizeObserver = new ResizeObserver(() => {
          lastScrollTop = container.scrollTop;
          lastScrollHeight = container.scrollHeight;

          if (isStickyRef.current) {
            scrollToEnd();
          }
        });

        // Monitor the size of the children within the scroll container
        for (const child of Array.from(container.children)) {
          resizeObserver.observe(child);
        }
      }
    }

    return () => {
      container?.removeEventListener('scroll', onScrollStart);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [container, scroller, scrollToEnd, enabled]);

  return { ref, container, isSticky, scrollToEnd };
}

class SmoothScroller {
  private animationFrame?: number;
  private startTime?: number;
  private startPos?: number;
  private endPos?: number;
  private duration?: number;
  private cancelled: boolean = false;
  private initialDuration?: number;

  constructor(private element: HTMLElement) {}

  public scrollTo(to: number, duration: number): Promise<void> {
    if (duration === 0) {
      this.element.scrollTo({
        top: to
      });
      return Promise.resolve();
    }

    const currentScrollTop = this.element.scrollTop;
    const currentTime = performance.now();

    if (this.animationFrame !== undefined) {
      cancelAnimationFrame(this.animationFrame);
    }

    // If an animation is already running, calculate the current position and progress
    if (
      this.startTime !== undefined &&
      this.startPos !== undefined &&
      this.endPos !== undefined &&
      this.initialDuration !== undefined
    ) {
      const timeElapsed = currentTime - this.startTime;
      const progress = Math.min(timeElapsed / this.initialDuration, 1);
      const easing = progress; // Linear interpolation
      this.startPos = this.startPos + (this.endPos - this.startPos) * easing;
      this.duration = (1 - progress) * duration;
    } else {
      // Otherwise, start a new animation from the current scroll position
      this.startPos = currentScrollTop;
      this.duration = duration;
    }

    this.endPos = to;
    this.startTime = currentTime;
    this.initialDuration = duration;
    this.cancelled = false;

    return new Promise((resolve) => {
      this.animationFrame = requestAnimationFrame((time) => this.animate(resolve, time));
    });
  }

  public get isAnimating() {
    return this.animationFrame !== undefined;
  }

  public cancel() {
    this.cancelled = true;
    if (this.animationFrame !== undefined) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.reset();
  }

  private easeInOutQuad(t: number): number {
    return t;
    // return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  private animate = (resolve: () => void, currentTime: number) => {
    if (
      this.cancelled ||
      this.startTime === undefined ||
      this.startPos === undefined ||
      this.endPos === undefined ||
      this.duration === undefined ||
      this.initialDuration === undefined
    ) {
      return;
    }

    const timeElapsed = currentTime - this.startTime;
    const progress = Math.min(timeElapsed / this.initialDuration, 1);
    const easing = this.easeInOutQuad(progress);
    const currentPos = this.startPos + (this.endPos - this.startPos) * easing;

    this.element.scrollTop = currentPos;

    if (progress < 1) {
      this.animationFrame = requestAnimationFrame((time) => this.animate(resolve, time));
    } else {
      this.reset();
      resolve();
    }
  };

  private reset() {
    this.animationFrame = undefined;
    this.startTime = undefined;
    this.startPos = undefined;
    this.endPos = undefined;
    this.duration = undefined;
    this.initialDuration = undefined;
  }
}
