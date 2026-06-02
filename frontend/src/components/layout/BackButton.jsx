import { useNavigate } from 'react-router-dom';

const BackButton = ({ fallback = '/' }) => {
  const navigate = useNavigate();
  const handleBack = () => {
    if (window.history.length > 2) navigate(-1);
    else navigate(fallback);
  };

  return (
    <button onClick={handleBack} className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '14px' }}>
      ← Back
    </button>
  );
};

export default BackButton;
