import {
  FaFacebook,
  FaInstagram,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import './Footer.css';

const MAPS_URL =
  'https://www.google.com/maps/place/Bella+Stone,+LLc/@43.4641412,-87.9532781,14.4z/data=!4m6!3m5!1s0x8804ecb6d0b3058f:0x75c35b6057b78256!8m2!3d43.4583816!4d-87.948204!16s%2Fg%2F1vbnpzy2?entry=ttu';

const Footer = () => {
  return (
    <footer className="footer-landing glass-panel">
      <div className="footer-content-landing">
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="maps-button"
          aria-label="Open Bella Stone location in Google Maps"
        >
          <img
            src="/BellaMap.png"
            alt="Bella Stone location map"
            className="maps-button__img"
          />
        </a>

        <div className="footer-info">
          <p className="footer-brand">Bella Stone</p>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-address"
          >
            <FaMapMarkerAlt aria-hidden="true" />
            <span>
              737 Tower Drive
              <br />
              Fredonia, WI
            </span>
          </a>
          <a href="tel:+1-414-617-8078" className="footer-contact-link">
            <FaPhone aria-hidden="true" />
            (414) 617-8078
          </a>
          <a href="mailto:bellastone@live.com" className="footer-contact-link">
            <FaEnvelope aria-hidden="true" />
            bellastone@live.com
          </a>
        </div>

        <div className="footer-social">
          <p className="footer-social-label">Follow Us</p>
          <div className="contact-grid-footer">
            <a
              href="https://www.facebook.com/BellaStoneLLC/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-button-top"
              aria-label="Facebook"
            >
              <FaFacebook size="1.35rem" />
            </a>
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-button-top"
              aria-label="Instagram"
            >
              <FaInstagram size="1.35rem" />
            </a>
            <a href="tel:+1-414-617-8078" className="social-button-top" aria-label="Phone">
              <FaPhone size="1.35rem" />
            </a>
            <a
              href="mailto:bellastone@live.com"
              className="social-button-top"
              aria-label="Email"
            >
              <FaEnvelope size="1.35rem" />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-copyright">
        <p>© Bella Stone LLC 2026</p>
      </div>
    </footer>
  );
};

export default Footer;
