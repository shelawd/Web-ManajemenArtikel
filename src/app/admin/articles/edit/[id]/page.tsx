"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ArticleForm from "@/components/features/admin/ArticleForm";
import api from "@/lib/axios";

type ArticleData = {
  title: string;
  content: string;
  categoryId: string;
  thumbnailUrl?: string;
};

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [initialData, setInitialData] = useState<ArticleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch article data for editing
  useEffect(() => {
    if (!id) return;

    const fetchArticleData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const response = await api.get(`/articles/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
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

  // Handle article update
  const handleUpdateArticle = async (data: any) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      
      const updatePayload = {
        title: data.title,
        content: data.content,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl,
      };

      await api.put(`/articles/${id}`, updatePayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return Promise.resolve(); // Success
    } catch (error: any) {
      console.error("Failed to update article:", error);
      if (error.response) {
        alert(
          `Failed to update article: ${JSON.stringify(
            error.response.data.error || error.response.data.message
          )}`
        );
      } else {
        alert("Failed to update article. Please try again.");
      }
      return Promise.reject(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading article data...</p>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">Article not found.</p>
          <button 
            onClick={() => router.push('/admin/articles')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <ArticleForm
      mode="edit"
      initialData={initialData}
      onSubmit={handleUpdateArticle}
      isSubmitting={isSubmitting}
    />
  );
}
