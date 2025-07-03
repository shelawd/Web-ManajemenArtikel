'use client';

import ArticleForm from '@/components/features/admin/ArticleForm';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Tipe data sesuai dengan skema Zod di ArticleForm
type ArticleFormData = {
  title: string;
  categoryId: string;
  content: string;
  thumbnail?: File;
};

export default function CreateArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateArticle = async (data: ArticleFormData) => {
    setIsSubmitting(true);
    
    // Gunakan FormData jika Anda mengirim file
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('categoryId', data.categoryId);
    formData.append('content', data.content);
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail);
    }

    try {
      // Ganti dengan endpoint API Anda
      await api.post('/articles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Tampilkan notifikasi sukses (misal: menggunakan react-toastify)
      alert('Artikel berhasil dibuat!');
      router.push('/admin/articles'); // Redirect ke halaman daftar artikel
    } catch (error) {
      console.error('Failed to create article:', error);
      alert('Gagal membuat artikel. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ArticleForm 
      onSubmit={handleCreateArticle}
      isSubmitting={isSubmitting}
    />
  );
}
