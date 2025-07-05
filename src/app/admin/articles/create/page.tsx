"use client";

import ArticleForm from "@/components/features/admin/ArticleForm";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateArticle = async (data: any) => {
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      
      const articlePayload = {
        title: data.title,
        content: data.content,
        categoryId: data.categoryId,
        imageUrl: data.imageUrl,
      };

      await api.post("/articles", articlePayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      return Promise.resolve(); // Success
    } catch (error: any) {
      console.error("Failed to create article:", error);
      if (error.response) {
        alert(
          `Failed to create article: ${JSON.stringify(
            error.response.data.error || error.response.data.message
          )}`
        );
      } else {
        alert("Failed to create article. Please try again.");
      }
      return Promise.reject(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ArticleForm 
      mode="create"
      onSubmit={handleCreateArticle} 
      isSubmitting={isSubmitting} 
    />
  );
}
