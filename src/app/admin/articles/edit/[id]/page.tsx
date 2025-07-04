"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ArticleForm from "@/components/features/admin/ArticleForm"; // Sesuaikan path jika perlu
import api from "@/lib/axios";

// Definisikan tipe data untuk data awal form
type ArticleData = {
  title: string;
  content: string;
  categoryId: string;
  thumbnailUrl?: string; // Atau imageUrl, sesuaikan dengan data Anda
};

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // Ambil ID dari URL

  const [initialData, setInitialData] = useState<ArticleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Ambil data artikel yang akan diedit
  useEffect(() => {
    if (!id) return;

    const fetchArticleData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const response = await api.get(`/articles/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Sesuaikan struktur data jika perlu
        const article = response.data;
        if (article) {
        setInitialData({
          title: article.title,
          content: article.content,
          categoryId: article.category.id,
          thumbnailUrl: article.imageUrl,
        });
    }
      } catch (error) {
        console.error("Failed to fetch article data:", error);
        alert("Failed to load article data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticleData();
  }, [id]);

  // 2. Fungsi untuk menangani update
  const handleUpdateArticle = async (data: any) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      // Note: `data` sudah berisi semua field dari form, termasuk `imageUrl` jika diubah
      await api.put(`/articles/${id}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Article updated successfully!");
      router.push("/admin/articles"); // Kembali ke daftar artikel
    } catch (error) {
      console.error("Failed to update article:", error);
      alert("Failed to update article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p>Loading editor...</p>;
  }

  return (
    <div>
      {initialData ? (
        <ArticleForm
          initialData={initialData}
          onSubmit={handleUpdateArticle}
          isSubmitting={isSubmitting}
        />
      ) : (
        <p>Article not found.</p>
      )}
    </div>
  );
}
