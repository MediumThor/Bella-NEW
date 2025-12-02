import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/our-process', label: 'Our Process' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/blog', label: 'Blog' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`navigation ${scrolled ? 'navigation-scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="logo" onClick={closeMenu}>
            <img src="/Logo.png" alt="Bella Stone Logo" className="logo-img" />
          </Link>
          <div className="nav-menu-wrapper">
            <button 
              className="menu-button"
              aria-label="Menu"
            >
              Menu
            </button>
            <ul className="nav-menu">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={location.pathname === item.path ? 'active' : ''}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/admin/login"
                  className="nav-sign-in"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
          <button 
            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <ul className={`nav-menu-mobile ${isMenuOpen ? 'open' : ''}`}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/admin/login"
                className="nav-sign-in"
                onClick={closeMenu}
              >
                Sign In
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Navigation;

