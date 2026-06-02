export const saveSession = ({ token, user, role }) => {
  const displayName = user?.name || user?.fullName || user?.ownerName || '';
  localStorage.setItem('authToken', token);
  localStorage.setItem('authUser', JSON.stringify({ ...user, name: displayName, role }));
};

export const getSession = () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('authUser');
  return { token, user: user ? JSON.parse(user) : null };
};

export const clearSession = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
};

export const roleHome = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'owner') return '/owner';
  return '/user';
};
