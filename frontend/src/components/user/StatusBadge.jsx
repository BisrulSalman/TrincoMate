
import { useTranslation } from 'react-i18next';

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  let badgeClass = 'badge-pending'; // Default
  if (String(status).toLowerCase() === 'approved' || String(status).toLowerCase() === 'confirmed') badgeClass = 'badge-success';
  if (String(status).toLowerCase() === 'rejected' || String(status).toLowerCase() === 'cancelled') badgeClass = 'badge-danger';

  return (
    <span className={`badge ${badgeClass}`}>
      {t(`status.${status}`) || status}
    </span>
  );
};

export default StatusBadge;
