// src/components/CommandPalette.jsx
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { navSections } from '../data/developerData.js';
import { projects } from '../data/projectsData.js';
import { skillGroups, techStack } from '../data/skillsData.js';

const ASK_AI_EVENT = 'open-chat';
const MAX_RESULTS_PER_GROUP = 6;

/**
 * Builds every searchable entry. Each entry carries its own `run` action.
 * @param {{ selectProject: (project: object) => void, closePalette: () => void }} actions
 */
function buildItems({ selectProject, closePalette }) {
  const navigateTo = (hash) => () => {
    closePalette();
    window.location.hash = hash;
  };

  const sectionItems = navSections.map((section) => ({
    id: `nav-${section.id}`,
    group: 'Sections',
    label: section.label,
    icon: 'arrowRight',
    keywords: section.label,
    run: navigateTo(`#${section.id}`)
  }));

  const projectItems = projects.map((project) => ({
    id: `project-${project.id}`,
    group: 'Projects',
    label: project.title,
    hint: project.category,
    icon: 'folder',
    keywords: `${project.title} ${project.category} ${project.tags.join(' ')}`,
    run: () => {
      closePalette();
      selectProject(project);
    }
  }));

  const skillItems = skillGroups.flatMap((group) =>
    group.skills.map((skill) => ({
      id: `skill-${group.id}-${skill.name}`,
      group: 'Skills',
      label: skill.name,
      hint: `${skill.level}%`,
      icon: 'code',
      keywords: `${skill.name} ${group.title}`,
      run: navigateTo('#skills')
    }))
  );

  const techItems = techStack.map((tech) => ({
    id: `tech-${tech}`,
    group: 'Tech',
    label: tech,
    icon: 'hash',
    keywords: tech,
    run: navigateTo('#skills')
  }));

  const actionItems = [
    {
      id: 'action-ask-ai',
      group: 'Actions',
      label: 'Ask the AI assistant',
      icon: 'sparkles',
      keywords: 'ai chat assistant ask help',
      run: () => {
        closePalette();
        window.dispatchEvent(new CustomEvent(ASK_AI_EVENT));
      }
    }
  ];

  return [...sectionItems, ...projectItems, ...skillItems, ...techItems, ...actionItems];
}

/**
 * Filters entries by query and caps each group so the list stays short.
 * @param {ReturnType<typeof buildItems>} items
 * @param {string} query
 */
function groupMatches(items, query) {
  const needle = query.trim().toLowerCase();
  const matches = needle ? items.filter((item) => item.keywords.toLowerCase().includes(needle)) : items;

  const grouped = new Map();
  for (const item of matches) {
    const bucket = grouped.get(item.group) ?? [];
    if (bucket.length < MAX_RESULTS_PER_GROUP) grouped.set(item.group, [...bucket, item]);
  }
  return [...grouped.entries()].map(([group, groupItems]) => ({ group, items: groupItems }));
}

/**
 * @param {{ isOpen: boolean, onClose: () => void, onSelectProject: (project: object) => void }} props
 */
export default function CommandPalette({ isOpen, onClose, onSelectProject }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const items = buildItems({ selectProject: onSelectProject, closePalette: onClose });
  const groups = groupMatches(items, query);
  const flatItems = groups.flatMap((group) => group.items);
  const activeItem = flatItems[activeIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleChange = (event) => {
    setQuery(event.target.value);
    setActiveIndex(0);
  };

  const handleKeyDown = (event) => {
    if (flatItems.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % flatItems.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + flatItems.length) % flatItems.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      activeItem?.run();
    }
  };

  const handleDialogClick = (event) => {
    if (event.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="dialog palette"
      aria-label="Command palette"
      onClose={onClose}
      onClick={handleDialogClick}
    >
      <div className="palette-search">
        <Icon name="search" size={18} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search sections, projects, skills"
          aria-label="Search the portfolio"
          aria-controls="palette-results"
          aria-activedescendant={activeItem ? `palette-item-${activeItem.id}` : undefined}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className="palette-list" id="palette-results" role="listbox" aria-label="Results">
        {groups.map(({ group, items: groupItems }) => (
          <div key={group} role="group" aria-label={group}>
            <div className="palette-group" aria-hidden="true">{group}</div>
            {groupItems.map((item) => {
              const index = flatItems.indexOf(item);
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.id}
                  id={`palette-item-${item.id}`}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  tabIndex={-1}
                  className={`palette-item${isActive ? ' is-active' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={item.run}
                >
                  <Icon name={item.icon} size={16} />
                  <span className="palette-item-label">{item.label}</span>
                  {item.hint && <span className="palette-item-hint">{item.hint}</span>}
                </button>
              );
            })}
          </div>
        ))}
        {flatItems.length === 0 && <p className="palette-empty">No matches for &ldquo;{query.trim()}&rdquo;.</p>}
      </div>

      <div className="palette-footer" aria-hidden="true">
        <span><kbd>↑↓</kbd> navigate</span>
        <span><kbd>↵</kbd> open</span>
        <span><kbd>esc</kbd> close</span>
      </div>
    </dialog>
  );
}
