import { useEffect } from 'react';
import './Page.css';

const Resources = () => {
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
      <section className="parallax-hero">
        <div 
          className="parallax-hero-image parallax" 
          data-speed="0.4"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)'
          }}
        >
          <div className="parallax-overlay">
            <h1>Resources</h1>
          </div>
        </div>
      </section>

      <div className="page-content">
        <div className="content-section">
          <p className="lead">
            Here you'll find helpful resources, links, and tools to support your Smart Living journey. 
            These curated resources are designed to help you in areas of wellness, leadership, 
            personal development, and more.
          </p>
        </div>

        <div className="three-column-section">
          <div className="column-card">
            <div className="column-image">
              <img 
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Wellness Resources" 
              />
            </div>
            <h2>Wellness Resources</h2>
            <p>
              Nutrition guides, fitness resources, stress management techniques, sleep optimization, 
              and product recommendations for health and wellness.
            </p>
          </div>
          <div className="column-card">
            <div className="column-image">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Leadership Resources" 
              />
            </div>
            <h2>Leadership & Development</h2>
            <p>
              Leadership principles, communication resources, personal development tools, book 
              recommendations, and professional development opportunities.
            </p>
          </div>
          <div className="column-card">
            <div className="column-image">
              <img 
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Sailing Resources" 
              />
            </div>
            <h2>Sailing Resources</h2>
            <p>
              Sailing education, safety resources, equipment recommendations, destination guides, 
              and community networking opportunities.
            </p>
          </div>
        </div>

        <div className="content-section">
          
          {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-card">
            <div className="cta-icon">📋</div>
            <h2>Take our Survey</h2>
            <p>You may qualify for $100 in free products</p>
            <button className="cta-button">Take Survey</button>
          </div>
          <div className="cta-card">
            <div className="cta-icon">🎥</div>
            <h2>Sign Up for Webinar</h2>
            <p>SIGN UP FOR AN UPCOMING INFORMATIONAL WEBINAR</p>
            <button className="cta-button">Sign Up</button>
          </div>
          <div className="cta-card">
            <div className="cta-icon">🌱</div>
            <h2>Steps to Healthier Living</h2>
            <p>LOOK AT STEPS TO HEALTHIER LIVING HERE</p>
            <button className="cta-button">Learn More</button>
          </div>
        </div>
      </section>
        </div>
      </div>
    </div>
  );
};

export default Resources;

