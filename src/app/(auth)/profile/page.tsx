import api from '@/lib/axios';

export async function fetchUserProfile() {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('Token tidak ditemukan');

  const response = await api.get('/auth/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data; // Pastikan response mengandung user info, termasuk role
}
