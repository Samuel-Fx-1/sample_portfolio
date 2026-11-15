// src/hooks/useInView.js
import { useEffect, useRef, useState } from 'react';

const HAS_INTERSECTION_OBSERVER = typeof IntersectionObserver !== 'undefined';

/**
 * Reports once an element has scrolled into view (then stops observing).
 * Without IntersectionObserver support the element is shown immediately.
 * @param {IntersectionObserverInit} [options]
 * @returns {[import('react').RefObject<HTMLElement>, boolean]}
 */
export default function useInView(options = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(() => !HAS_INTERSECTION_OBSERVER);
  const { threshold, rootMargin } = options;

  useEffect(() => {
    const node = ref.current;
    if (!node || !HAS_INTERSECTION_OBSERVER) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold, rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, inView];
}
