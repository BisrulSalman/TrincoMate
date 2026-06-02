import { useState } from 'react';
import { userProfile } from '../../data/mockData';
import { Mail, Phone, MapPin, Calendar, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...userProfile });
  const { t } = useTranslation();

  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
    alert('Profile updated successfully! (Mock Action)');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '30px' }}>{t('profile.myProfile')}</h1>

      <div className="card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '30px' }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={formData.avatar} 
              alt={formData.name} 
              style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            <button style={{ 
              position: 'absolute', bottom: 0, right: 0, 
              background: 'var(--primary-color)', color: 'white', 
              border: 'none', borderRadius: '50%', width: '36px', height: '36px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
            }}>
              <Camera size={18} />
            </button>
          </div>
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{formData.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)', fontSize: '14px' }}>
              <Calendar size={16} /> {t('profile.joined', { date: formData.joinDate })}
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave}>
            <div className="grid-2">
              <div className="input-group">
                <label>{t('profile.fullName')}</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="input-group">
                <label>{t('profile.email')}</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="input-group">
                <label>{t('profile.phone')}</label>
                <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="input-group">
                <label>{t('profile.address')}</label>
                <input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div>
            <div className="grid-2" style={{ gap: '20px' }}>
              <div>
                <h4 style={{ color: 'var(--text-light)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>Email</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' }}>
                  <Mail size={18} color="var(--primary-color)" /> {formData.email}
                </div>
              </div>
              <div>
                <h4 style={{ color: 'var(--text-light)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>Phone</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' }}>
                  <Phone size={18} color="var(--primary-color)" /> {formData.phone}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                <h4 style={{ color: 'var(--text-light)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>Address</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px' }}>
                  <MapPin size={18} color="var(--primary-color)" /> {formData.address}
                </div>
              </div>
            </div>
            <button className="btn btn-outline" style={{ marginTop: '30px' }} onClick={() => setIsEditing(true)}>
              {t('profile.editProfile')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
