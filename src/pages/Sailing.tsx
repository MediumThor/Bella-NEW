import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Page.css';

const Sailing = () => {
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
            backgroundImage: 'url(/sailing.jpg)'
          }}
        >
          <div className="parallax-overlay">
            <h1>Sailing</h1>
          </div>
        </div>
      </section>

      <div className="page-content">
        <div className="content-section">
          <p className="lead">
            Sailing is one of my great passions. The water has taught me invaluable lessons 
            about patience, teamwork, and the importance of being present in the moment.
          </p>
        </div>

        <div className="three-column-section">
          <div className="column-card">
            <div className="column-image">
              <img 
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Sailing Freedom" 
              />
            </div>
            <div className="column-card-content">
              <h2>The Freedom of the Open Water</h2>
              <p>
                There's something uniquely liberating about being on the water, harnessing the 
                wind, and navigating by skill and intuition.
              </p>
              <p style={{ marginTop: '1rem' }}>
                Experience the ultimate sailing adventure with our Caribbean sailing charters. 
                Join us for hands-on sailing experiences, explore beautiful destinations, and 
                become part of a real crew sailing through some of the most beautiful waters 
                in the world.
              </p>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h2>Sailing and Smart Living</h2>
          <p>
            Sailing embodies many principles of Smart Living: it requires discipline and 
            preparation, offers physical and mental wellness benefits, demands leadership 
            and teamwork, and provides a sense of freedom and adventure.
          </p>
        </div>

        <div className="content-section">
          <p>
            I'll be sharing more sailing stories, insights, and experiences in my blog. 
            If you're interested in sailing or have questions, feel free to reach out through 
            the contact form.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sailing;

