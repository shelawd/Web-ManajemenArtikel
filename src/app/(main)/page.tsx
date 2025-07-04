'use client';

import { useState, useCallback, useEffect } from "react"; 
import ArticleFilters from "@/components/features/articles/ArticleFilters";
import ArticleList from "@/components/features/articles/ArticleList";
import { fetchUserProfile } from "@/lib/auth";

export default function Home() {
  const [filters, setFilters] = useState({ category: '', search: '' });
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile()
      .then(profile => {
        setRole(profile.role);
      })
      .catch(() => {
        setRole(null);
        // Kalau mau, redirect ke login jika token invalid
        // window.location.href = '/login';
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFilterChange = useCallback((newFilters: { category: string; search: string }) => {
    setFilters(newFilters);
  }, []);

  if (loading) return <p>Loading...</p>;

  // Jika admin, bisa redirect ke /admin misal
  if (role === 'admin') {
    if (typeof window !== 'undefined') window.location.href = '/admin';
    return null; // Prevent render sebelum redirect
  }

  // Render user homepage
  return (
    <div className="w-full ">
      <div className="text-center bg-blue-600 py-16 px-4 text-white">
        <p className="font-semibold text-2xl">Blog genzet</p>
        <h1 className="text-4xl md:text-5xl font-bold my-2">The Journal: Design Resources, Interviews, and Industry News</h1>
        <p className="text-3xl">Your daily dose of design insights!</p>

        <div className="max-w-2xl mx-auto mt-6">
          <ArticleFilters onFilterChange={handleFilterChange} />
        </div>
      </div>

      <ArticleList filters={filters} />
    </div>
  );
}
