import { useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="container section-padding animate-fade-in">
      <div className="text-center" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>Contact Us</h1>
        <p>Get in touch with the TrincoMate team</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="card">
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Send us a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Your Name</label>
              <input type="text" required placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" required placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Message</label>
              <textarea rows="5" required placeholder="How can we help you?" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Message</button>
          </form>
        </div>

        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin color="var(--primary-color)" /> Office Location
            </h3>
            <p style={{ color: 'var(--text-light)' }}>123 Beach Road, Trincomalee, Sri Lanka</p>
          </div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Phone color="var(--primary-color)" /> Phone Number
            </h3>
            <p style={{ color: 'var(--text-light)' }}>+94 26 123 4567</p>
          </div>
          <div className="card">
            <h3 style={{ fontSize: '20px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail color="var(--primary-color)" /> Email Address
            </h3>
            <p style={{ color: 'var(--text-light)' }}>info@trincomate.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
