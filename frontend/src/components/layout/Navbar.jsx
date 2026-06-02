import { Link, useLocation } from 'react-router-dom';
import { Compass, User, Moon, Sun } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n';

const Navbar = () => {
  const location = useLocation();
  const [theme, setTheme] = useState('light');
  const { t } = useTranslation();
  const [lang, setLang] = useState(localStorage.getItem('i18nextLng') || 'en');
  const langRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    document.body.classList.toggle('dark-theme', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    setTheme(nextTheme);
    document.body.classList.toggle('dark-theme', nextTheme === 'dark');
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'Tamil' },
    { code: 'si', label: 'Sinhala' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'ru', label: 'Русский' },
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' },
    { code: 'it', label: 'Italiano' },
    { code: 'es', label: 'Español' }
  ];

  const [langOpen, setLangOpen] = useState(false);

  const changeLang = async (code) => {
    await changeLanguage(code);
    setLang(code);
    setLangOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') setLangOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <nav style={{
      backgroundColor: 'var(--white)',
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: 'var(--shadow)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)', fontSize: '24px', fontWeight: 'bold' }}>
        <Compass size={32} />
        TrincoMate
      </Link>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        <Link to="/" style={{ fontWeight: 500, color: isActive('/') ? 'var(--primary-color)' : 'var(--text-dark)' }}>{t('nav.home')}</Link>
        <Link to="/categories" style={{ fontWeight: 500, color: isActive('/categories') ? 'var(--primary-color)' : 'var(--text-dark)' }}>{t('nav.categories')}</Link>
        <Link to="/about" style={{ fontWeight: 500, color: isActive('/about') ? 'var(--primary-color)' : 'var(--text-dark)' }}>{t('nav.about')}</Link>
        <Link to="/contact" style={{ fontWeight: 500, color: isActive('/contact') ? 'var(--primary-color)' : 'var(--text-dark)' }}>{t('nav.contact')}</Link>

        <button type="button" onClick={toggleTheme} className="btn btn-outline" style={{ padding: '8px 14px', gap: '8px' }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? t('nav.light') : t('nav.dark')}
        </button>

        <div style={{ display: 'flex', gap: '10px', marginLeft: '20px', alignItems: 'center' }} ref={langRef}>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center' }}
              onClick={() => setLangOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={langOpen}
            >
              <span role="img" aria-label="language">🌐</span>
              {languages.find(l => l.code === lang)?.label || 'English'}
            </button>

            {langOpen && (
              <div
                className="lang-menu"
                role="menu"
                aria-label="Select language"
                style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '8px',
                  background: 'var(--white)',
                  boxShadow: 'var(--shadow)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  zIndex: 200,
                  minWidth: '180px'
                }}
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    role="menuitem"
                    onClick={() => changeLang(l.code)}
                    className="btn btn-ghost"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span style={{ fontWeight: l.code === lang ? 700 : 500 }}>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/login" className="btn btn-outline" style={{ padding: '8px 16px', gap: '8px' }}>
            <User size={18} />
            {t('nav.signin')}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
