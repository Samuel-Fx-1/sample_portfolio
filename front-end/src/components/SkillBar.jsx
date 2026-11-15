// src/components/SkillBar.jsx
const PERCENT = 100;

/**
 * Presentational bar. Its fill animates when the parent group gets `is-visible`.
 * @param {{ name: string, level: number, delayMs?: number }} props
 */
export default function SkillBar({ name, level, delayMs = 0 }) {
  const fraction = Math.min(Math.max(level, 0), PERCENT) / PERCENT;
  return (
    <li className="skill-bar">
      <div className="skill-bar-head">
        <span>{name}</span>
        <span className="skill-bar-level">{level}%</span>
      </div>
      <div className="skill-bar-track" aria-hidden="true">
        <div
          className="skill-bar-fill"
          style={{ '--level': fraction, '--bar-delay': `${delayMs}ms` }}
        />
      </div>
    </li>
  );
}
