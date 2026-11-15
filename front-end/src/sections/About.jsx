// src/sections/About.jsx
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { developer, strengths, timeline } from '../data/developerData.js';

export default function About() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="container">
        <SectionHeader index="01" title="About me" id="about-title" />

        <div className="about-grid">
          <Reveal className="about-intro">
            <p>
              <strong>{developer.name}</strong> is a {developer.role.toLowerCase()} based in Rwanda, working
              remotely with clients worldwide.
            </p>
            <p>{developer.passion}, with a bias for software that holds up under real traffic and real data.</p>
          </Reveal>

          <ul className="strengths">
            {strengths.map((strength, index) => (
              <Reveal as="li" key={strength.title} delay={index * 90} className="card strength">
                <span className="icon-badge" aria-hidden="true">
                  <Icon name={strength.icon} size={22} />
                </span>
                <div>
                  <h3>{strength.title}</h3>
                  <p>{strength.description}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal className="card timeline-card">
          <h3>Experience</h3>
          <ol className="timeline">
            {timeline.map((entry) => (
              <li key={entry.period}>
                <span className="timeline-period">{entry.period}</span>
                <h4>{entry.title}</h4>
                <p>{entry.description}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
