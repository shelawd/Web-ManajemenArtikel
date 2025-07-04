"use client";

import ArticleForm from "@/components/features/admin/ArticleForm";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const handleCreateArticle = async (data) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("categoryId", data.categoryId);
      formData.append("content", data.content);
      if (data.thumbnail) {
        formData.append("thumbnail", data.thumbnail);
      }

      // Ambil token JWT dari localStorage atau tempat kamu simpan
      const token = localStorage.getItem("access_token");

      await api.post("/articles", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Kirim JWT di header Authorization
        },
      });

      alert("Artikel berhasil dibuat!");
      router.push("/admin/articles"); // Redirect ke daftar artikel
    } catch (error) {
      console.error("Gagal membuat artikel:", error);
      alert("Gagal membuat artikel. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ArticleForm onSubmit={handleCreateArticle} isSubmitting={isSubmitting} />
  );
}
