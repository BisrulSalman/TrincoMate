import { Compass } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#1e293b', color: 'var(--white)', padding: '60px 0 20px' }}>
      <div className="container grid-4">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
            <Compass size={32} />
            TrincoMate
          </div>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
            Your Travel Companion in Trincomalee — curated stays, tours, and experiences.
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <a href="#" style={{ color: '#cbd5e1' }}>Facebook</a>
            <a href="#" style={{ color: '#cbd5e1' }}>Twitter</a>
            <a href="#" style={{ color: '#cbd5e1' }}>Instagram</a>
          </div>
        </div>

        <div>
          <h4 style={{ color: 'var(--white)', marginBottom: '20px' }}>Quick Links</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#94a3b8' }}>
            <li><a href="/">Home</a></li>
            <li><a href="/categories">Categories</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'var(--white)', marginBottom: '20px' }}>Services</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#94a3b8' }}>
            <li><a href="/category/hotels">Hotels & Resorts</a></li>
            <li><a href="/category/restaurants">Restaurants</a></li>
            <li><a href="/category/tour-guides">Tour Guides</a></li>
            <li><a href="/category/water-sports">Water Sports</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'var(--white)', marginBottom: '20px' }}>Contact Info</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#94a3b8' }}>
            <li>Trincomalee, Sri Lanka</li>
            <li>info@trincomate.com</li>
            <li>+94 26 123 4567</li>
          </ul>
        </div>
      </div>

      <div className="container" style={{ marginTop: '60px', borderTop: '1px solid #334155', paddingTop: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
        &copy; {new Date().getFullYear()} TrincoMate. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
