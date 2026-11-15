// src/sections/Skills.jsx
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import SkillBar from '../components/SkillBar.jsx';
import useInView from '../hooks/useInView.js';
import { skillGroups, techStack } from '../data/skillsData.js';

const BAR_STAGGER_MS = 90;

/** @param {{ group: { id: string, title: string, icon: string, skills: Array<{name: string, level: number}> }, delay: number }} props */
function SkillGroup({ group, delay }) {
  const [barsRef, barsVisible] = useInView({ threshold: 0.3, rootMargin: '0px' });
  return (
    <Reveal delay={delay} className="card skill-group">
      <div className="skill-group-head">
        <span className="icon-badge" aria-hidden="true"><Icon name={group.icon} size={22} /></span>
        <h3>{group.title}</h3>
      </div>
      <ul ref={barsRef} className={`skill-bars${barsVisible ? ' is-visible' : ''}`}>
        {group.skills.map((skill, index) => (
          <SkillBar key={skill.name} name={skill.name} level={skill.level} delayMs={index * BAR_STAGGER_MS} />
        ))}
      </ul>
    </Reveal>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="container">
        <SectionHeader
          index="03"
          title="Skills & tools"
          id="skills-title"
          subtitle="Self-assessed proficiency across the stack I use day to day."
        />

        <div className="skills-grid">
          {skillGroups.map((group, index) => (
            <SkillGroup key={group.id} group={group} delay={index * 100} />
          ))}
        </div>

        <Reveal className="card tech-stack">
          <h3>Also working with</h3>
          <ul className="tag-list">
            {techStack.map((tech) => (
              <li key={tech}><span className="chip">{tech}</span></li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
