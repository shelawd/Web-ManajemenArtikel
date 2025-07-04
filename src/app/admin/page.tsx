'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Halaman ini berfungsi sebagai "pintu masuk" ke area admin.
// Dia akan langsung mengarahkan pengguna ke halaman daftar artikel.
export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/articles');
  }, [router]);

  // Tampilkan loading state selagi redirect
  return <p>Loading Admin Dashboard...</p>;
}