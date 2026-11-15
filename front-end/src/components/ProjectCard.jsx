// src/components/ProjectCard.jsx
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';

/**
 * @param {{ project: object, index: number, onOpen: (project: object) => void }} props
 */
export default function ProjectCard({ project, index, onOpen }) {
  const { id, title, category, year, summary, tags, accent, featured } = project;
  const titleId = `project-${id}-title`;

  return (
    <Reveal
      as="article"
      delay={Math.min(index, 5) * 60}
      className={`card project-card${featured ? ' is-featured' : ''}`}
      style={{ '--project-accent': accent }}
      aria-labelledby={titleId}
    >
      <div className="project-card-top">
        <span className="project-category">{category}</span>
        <span>{year}</span>
      </div>
      <h3 id={titleId}>{title}</h3>
      <p>{summary}</p>
      <ul className="tag-list" aria-label="Technologies">
        {tags.slice(0, 5).map((tag) => (
          <li className="tag" key={tag}>{tag}</li>
        ))}
      </ul>
      <div className="project-card-actions">
        <button type="button" className="project-open" onClick={() => onOpen(project)}>
          View details
          <Icon name="arrowRight" size={16} className="icon-slide" />
        </button>
      </div>
    </Reveal>
  );
}
