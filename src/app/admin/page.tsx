'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';


export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/articles');
  }, [router]);

  return <p>Loading Admin Dashboard...</p>;
}