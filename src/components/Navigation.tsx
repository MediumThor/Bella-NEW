import { useState, useEffect, useCallback, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const NAV_ITEMS = [
  { path: '/', label: 'Home', end: true },
  { path: '/our-process', label: 'Our Process' },
  { path: '/inventory', label: 'Inventory' },
] as const;

const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = () => setIsMenuOpen((open) => !open);

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [location.pathname, closeMenu]);

  useEffect(() => {
    document.body.classList.toggle('nav-menu-open', isMenuOpen);
    return () => document.body.classList.remove('nav-menu-open');
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen, closeMenu]);

  useEffect(() => {
    const nav = document.querySelector('.navigation');
    if (!nav) return;

    const updateNavHeight = () => {
      const height = Math.ceil(nav.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--bs-nav-height', `${height}px`);
    };

    updateNavHeight();
    const observer = new ResizeObserver(updateNavHeight);
    observer.observe(nav);
    window.addEventListener('resize', updateNavHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateNavHeight);
    };
  }, []);

  return (
    <header className={`navigation ${scrolled ? 'navigation--scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu} aria-label="Bella Stone home">
          <img src="/Logo.png" alt="" className="nav-logo__img" width={120} height={68} />
        </Link>

        <nav className="nav-desktop" aria-label="Main">
          <ul className="nav-links">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path, 'end' in item ? item.end : undefined) ? 'nav-link--active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/admin/login" className="nav-cta">
            Sign In
          </Link>
        </nav>

        <button
          type="button"
          className={`nav-toggle ${isMenuOpen ? 'nav-toggle--open' : ''}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="nav-drawer"
        >
          <span className="nav-toggle__bar" aria-hidden />
          <span className="nav-toggle__bar" aria-hidden />
          <span className="nav-toggle__bar" aria-hidden />
        </button>
      </div>

      <div
        className={`nav-overlay ${isMenuOpen ? 'nav-overlay--visible' : ''}`}
        onClick={closeMenu}
        aria-hidden={!isMenuOpen}
      />

      <nav
        id="nav-drawer"
        className={`nav-drawer ${isMenuOpen ? 'nav-drawer--open' : ''}`}
        aria-label="Mobile menu"
        aria-hidden={!isMenuOpen}
      >
        <ul className="nav-drawer__links">
          {NAV_ITEMS.map((item, index) => (
            <li key={item.path} style={{ '--nav-item-delay': `${index * 40}ms` } as CSSProperties}>
              <Link
                to={item.path}
                className={`nav-drawer__link ${isActive(item.path, 'end' in item ? item.end : undefined) ? 'nav-drawer__link--active' : ''}`}
                onClick={closeMenu}
                tabIndex={isMenuOpen ? 0 : -1}
              >
                <span className="nav-drawer__label">{item.label}</span>
                {isActive(item.path, 'end' in item ? item.end : undefined) && (
                  <span className="nav-drawer__indicator" aria-hidden />
                )}
              </Link>
            </li>
          ))}
        </ul>
        <div className="nav-drawer__footer">
          <Link
            to="/admin/login"
            className="nav-drawer__cta"
            onClick={closeMenu}
            tabIndex={isMenuOpen ? 0 : -1}
          >
            Sign In
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
