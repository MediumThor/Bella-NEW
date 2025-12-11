import { FaFacebook, FaInstagram, FaPhone, FaEnvelope } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-landing">
      <div className="footer-content-landing">
        <a 
          href="https://www.google.com/maps/place/Bella+Stone,+LLc/@43.4641412,-87.9532781,14.4z/data=!4m6!3m5!1s0x8804ecb6d0b3058f:0x75c35b6057b78256!8m2!3d43.4583816!4d-87.948204!16s%2Fg%2F1vbnpzy2?entry=ttu" 
          target="_blank" 
          rel="noopener noreferrer"
          className="maps-button"
        >
          <img src="/BellaMap.png" alt="Location" style={{ width: '250px', height: '250px', borderRadius: '7px' }} />
        </a>

        <div className="contact-grid-footer">
          <a href="https://www.facebook.com/BellaStoneLLC/" target="_blank" rel="noopener noreferrer" className="social-button-top">
            <FaFacebook size="2rem" />
          </a>
          <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="social-button-top">
            <FaInstagram size="2rem" />
          </a>
          <a href="tel:+1-414-617-8078" className="social-button-top">
            <FaPhone size="2rem" />
          </a>
          <a href="mailto:bellastone@live.com" className="social-button-top">
            <FaEnvelope size="2rem" />
          </a>
        </div>
      </div>
      <div className="footer-copyright">
        <p>Copyright Bella Stone LLC 2026</p>
      </div>
    </footer>
  );
};

export default Footer;

