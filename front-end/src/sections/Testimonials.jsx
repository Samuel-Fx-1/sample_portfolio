// src/sections/Testimonials.jsx
import SectionHeader from '../components/SectionHeader.jsx';
import TestimonialCard from '../components/TestimonialCard.jsx';
import { testimonials } from '../data/testimonialsData.js';

export default function Testimonials() {
  return (
    <section id="testimonials" className="section" aria-labelledby="testimonials-title">
      <div className="container">
        <SectionHeader index="04" title="What clients say" id="testimonials-title" />
        <div className="testimonial-grid">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
