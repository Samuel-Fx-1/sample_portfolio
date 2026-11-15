// src/sections/Projects.jsx
import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { projectCategories, projects } from '../data/projectsData.js';

const ALL_CATEGORY = 'All';

/** Case-insensitive match against the fields a visitor would reasonably search. */
function matchesQuery(project, query) {
  if (!query) return true;
  const haystack = [project.title, project.summary, project.category, ...project.tags]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

/**
 * @param {{ onOpenProject: (project: object) => void }} props
 */
export default function Projects({ onOpenProject }) {
  const [category, setCategory] = useState(ALL_CATEGORY);
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();
  const inCategory = (project) => category === ALL_CATEGORY || project.category === category;
  const visible = projects.filter((project) => inCategory(project) && matchesQuery(project, normalizedQuery));

  const countFor = (name) =>
    name === ALL_CATEGORY ? projects.length : projects.filter((project) => project.category === name).length;

  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="container">
        <SectionHeader
          index="02"
          title="Selected work"
          id="projects-title"
          subtitle="Products and tools I've designed and shipped. Filter by category, search by stack, or open a project for details."
        />

        <div className="project-toolbar">
          <div className="project-filters" role="group" aria-label="Filter projects by category">
            {projectCategories.map((name) => {
              const isActive = category === name;
              return (
                <button
                  key={name}
                  type="button"
                  className="chip"
                  aria-pressed={isActive}
                  onClick={() => setCategory(name)}
                >
                  {name}
                  <span className="chip-count">{countFor(name)}</span>
                </button>
              );
            })}
          </div>

          <label className="project-search">
            <span className="visually-hidden">Search projects</span>
            <span className="input-icon" aria-hidden="true"><Icon name="search" size={16} /></span>
            <input
              type="search"
              className="input"
              placeholder="Search by name or tech"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <p className="project-count" aria-live="polite">
            {visible.length} of {projects.length} projects
          </p>
        </div>

        {visible.length > 0 ? (
          <div className="project-grid">
            {visible.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} onOpen={onOpenProject} />
            ))}
          </div>
        ) : (
          <p className="empty-state">
            No projects match “{query.trim()}”.{' '}
            <button type="button" className="text-button" onClick={() => { setQuery(''); setCategory(ALL_CATEGORY); }}>
              Clear filters
            </button>
          </p>
        )}
      </div>
    </section>
  );
}
