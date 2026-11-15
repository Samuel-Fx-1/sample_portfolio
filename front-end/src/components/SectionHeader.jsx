// src/components/SectionHeader.jsx
import Reveal from './Reveal.jsx';

/** @param {{ index: string, title: string, subtitle?: string, id?: string }} props */
export default function SectionHeader({ index, title, subtitle, id }) {
  return (
    <Reveal className="section-header">
      <span className="section-eyebrow">
        <span className="section-index">{index}</span>
        <span className="section-rule" aria-hidden="true" />
      </span>
      <h2 id={id}>{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </Reveal>
  );
}
