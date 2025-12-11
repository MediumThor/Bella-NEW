import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Page.css';

const Leadership = () => {
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax');
      parallaxElements.forEach((element) => {
        const speed = element.getAttribute('data-speed') || '0.5';
        const yPos = -(scrolled * parseFloat(speed));
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="page-container">
      <main>
        <section className="parallax-hero">
          <div 
            className="parallax-hero-image parallax" 
            data-speed="0.4"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)'
            }}
          >
            <div className="parallax-overlay">
              <h1>Developing Leadership Skills</h1>
            </div>
          </div>
        </section>

        <div className="page-content">
          {/* Hero Content */}
          <section className="content-section">
            <h2>Leadership is a Journey</h2>
            <p className="lead">
              Leadership is not a title you earn once—it is a lifelong journey of learning, self-reflection,
              and intentional action. The most effective leaders are curious, humble, and willing to grow.
            </p>
            <p>
              Whether you are leading a team, guiding a project, or simply choosing how you show up in your
              own life, leadership is about influence, responsibility, and integrity.
            </p>
            <p>
              For emerging leaders, managers, and high-performers committed to growth, these principles
              provide a practical framework for leading with clarity and purpose.
            </p>
            <p>
              <Link to="/connect" className="submit-button">
                Start Your Leadership Journey
              </Link>
            </p>
          </section>

          {/* Introduction: Leadership as a Journey */}
          <section className="content-section">
            <h2>Leadership is a Journey, Not a Destination</h2>
            <p>
              Leadership is an ongoing process of learning, unlearning, and adapting. There is no finish line,
              only the next opportunity to practice being the kind of leader you want to be.
            </p>
            <p>
              It is less about a job title and more about how you choose to influence the people and environments
              around you. Leadership shows up in how you make decisions, how you respond under pressure, and how
              you take responsibility for your impact.
            </p>
            <p>
              These principles apply whether you are leading a formal team, coordinating a project, or simply
              leading your own life with greater intention and purpose.
            </p>
          </section>

          {/* Core Pillars */}
          <section className="content-section">
            <h2>Core Pillars of Effective Leadership</h2>
            <div className="three-column-section">
              <div className="column-card">
                <div className="column-image">
                  <img 
                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Self-Awareness" 
                  />
                </div>
                <h3>Self-Awareness</h3>
                <p>
                  Effective leadership begins with knowing yourself. That includes your strengths, blind spots,
                  values, and triggers. Self-aware leaders are honest with themselves, take responsibility for
                  their impact, and lead from a place of authenticity.
                </p>
              </div>
              <div className="column-card">
                <div className="column-image">
                  <img 
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Clear Communication" 
                  />
                </div>
                <h3>Clear Communication</h3>
                <p>
                  Great leaders listen deeply, set clear expectations, and have honest conversations. They know
                  that clarity in both written and verbal communication builds trust, reduces friction, and keeps
                  people aligned on what matters most.
                </p>
              </div>
              <div className="column-card">
                <div className="column-image">
                  <img 
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Adaptability & Growth" 
                  />
                </div>
                <h3>Adaptability &amp; Growth</h3>
                <p>
                  The world changes quickly. Effective leaders stay flexible, learn from feedback, and are willing
                  to adjust course when needed. They see challenges as opportunities to refine their approach and
                  grow alongside their teams.
                </p>
              </div>
            </div>
          </section>

          {/* Outcomes / Benefits */}
          <section className="content-section">
            <h2>What You&apos;ll Develop</h2>
            <p>
              Leadership growth is tangible. As you build these skills, you will notice real changes in how you
              think, communicate, and respond to the people and situations around you.
            </p>
            <ul className="feature-list">
              <li>Greater confidence in making decisions and taking responsibility.</li>
              <li>Stronger, more trusting relationships with your team and peers.</li>
              <li>Improved ability to navigate conflict and difficult conversations.</li>
              <li>Clearer communication of vision, goals, and expectations.</li>
              <li>More resilience and emotional regulation under pressure.</li>
              <li>A stronger sense of purpose in your work and life.</li>
              <li>A practical framework for ongoing personal development.</li>
            </ul>
          </section>

          {/* Who This Is For */}
          <section className="content-section">
            <h2>Who This Is For</h2>
            <p>
              Leadership is not reserved for executives. It is for anyone willing to take ownership of their
              growth and the impact they have on others.
            </p>
            <ul className="feature-list">
              <li>New or aspiring managers stepping into leadership roles.</li>
              <li>Experienced leaders who want to refine and refresh their approach.</li>
              <li>Business owners and entrepreneurs leading small, committed teams.</li>
              <li>Individuals leading initiatives, projects, or communities.</li>
              <li>Anyone who wants to lead their own life with more intention.</li>
            </ul>
          </section>

          {/* How We Can Work Together */}
          <section className="content-section">
            <h2>How We Can Work Together</h2>
            <p>
              Leadership development can take many forms. Depending on your goals, we can focus on individual
              coaching, small group work, or experiences that bring your team together around shared learning.
            </p>
            <p>
              Together, we&apos;ll clarify where you are today, define what effective leadership looks like for
              you, and design practical steps to move in that direction.
            </p>
            <ul>
              <li>One-on-one leadership coaching.</li>
              <li>Small group or team sessions.</li>
              <li>Workshops and facilitated conversations.</li>
            </ul>
          </section>

          {/* Closing Call-to-Action */}
          <section className="content-section">
            <h2>Start Your Leadership Journey</h2>
            <p>
              Leadership is a lifelong journey. Small, consistent steps in self-awareness, communication, and
              adaptability create meaningful change over time—for you and for the people you lead.
            </p>
            <p>
              If you&apos;re ready to explore what&apos;s next in your leadership, let&apos;s connect and design
              a path that fits your season of life and work.
            </p>
            <p>
              <Link to="/connect" className="submit-button">
                Schedule a Conversation
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Leadership;

