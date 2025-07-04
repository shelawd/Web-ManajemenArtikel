import api from './axios';

export async function fetchUserProfile() {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No token found');

  const response = await api.get('/auth/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data; // data mengandung role, username, dsb.
}
