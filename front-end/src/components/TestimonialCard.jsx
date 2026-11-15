// src/components/TestimonialCard.jsx
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';

/** @param {{ testimonial: { id: number | string, name: string, role: string, text: string }, index: number }} props */
export default function TestimonialCard({ testimonial, index }) {
  return (
    <Reveal as="figure" delay={index * 100} className="card testimonial-card">
      <Icon name="quote" size={28} />
      <blockquote>
        <p>{testimonial.text}</p>
      </blockquote>
      <figcaption>
        <span className="testimonial-name">{testimonial.name}</span>
        <span className="testimonial-role">{testimonial.role}</span>
      </figcaption>
    </Reveal>
  );
}
