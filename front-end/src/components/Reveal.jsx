// src/components/Reveal.jsx
import useInView from '../hooks/useInView.js';

/**
 * Fades + lifts its children in the first time they scroll into view.
 * Motion is disabled by CSS under prefers-reduced-motion.
 * @param {{ as?: string, delay?: number, className?: string, children: import('react').ReactNode }} props
 */
export default function Reveal(props) {
  const { as: Tag = 'div', delay = 0, className = '', children, ...rest } = props;
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
