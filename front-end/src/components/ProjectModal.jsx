// src/components/ProjectModal.jsx
import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';
import { safeExternalUrl } from '../lib/safeUrl.js';

/**
 * @param {{ project: object | null, onClose: () => void }} props
 */
export default function ProjectModal({ project, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (project && !dialog.open) {
      dialog.showModal();
    } else if (!project && dialog.open) {
      dialog.close();
    }
  }, [project]);

  const handleDialogClick = (event) => {
    if (event.target === dialogRef.current) onClose();
  };

  const githubUrl = safeExternalUrl(project?.links?.github);
  const liveUrl = safeExternalUrl(project?.links?.live);

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="project-modal-title"
      onClose={onClose}
      onClick={handleDialogClick}
    >
      {project && (
        <div className="project-modal-body">
          <button type="button" className="icon-btn dialog-close" onClick={onClose} aria-label="Close project details">
            <Icon name="close" size={18} />
          </button>

          <div className="project-modal-banner" style={{ '--project-accent': project.accent }} aria-hidden="true" />

          <p className="project-modal-meta">
            <span>{project.year}</span>
            <span>{project.category}</span>
          </p>
          <h2 id="project-modal-title">{project.title}</h2>
          <p>{project.description}</p>

          <h3>Highlights</h3>
          <ul className="highlight-list">
            {project.highlights.map((highlight) => (
              <li key={highlight}>
                <Icon name="check" size={16} />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>

          <h3>Stack</h3>
          <ul className="tag-list">
            {project.tags.map((tag) => (
              <li key={tag} className="tag">{tag}</li>
            ))}
          </ul>

          <div className="project-modal-actions">
            {liveUrl && (
              <a className="btn btn-primary" href={liveUrl} target="_blank" rel="noopener noreferrer">
                Live site <Icon name="external" size={16} />
              </a>
            )}
            {githubUrl && (
              <a className="btn btn-ghost" href={githubUrl} target="_blank" rel="noopener noreferrer">
                <Icon name="github" size={16} /> Source code
              </a>
            )}
            {!liveUrl && !githubUrl && (
              <p className="muted-note">Source and live links for this project are not public yet.</p>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
