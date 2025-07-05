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

  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center w-full">
      <p className="text-lg text-gray-600">Loading...</p>
    </div>
  );

  // Jika admin, bisa redirect ke /admin misal
  if (role === 'admin') {
    if (typeof window !== 'undefined') window.location.href = '/admin';
    return null; 
  }

  // Render user homepage
  return (
    <div className="w-full overflow-x-hidden">
      <div className="bg-blue-600 text-white w-full">
        <div className="max-w-screen-lg mx-auto px-2 sm:px-4 md:px-8 py-8 md:py-14 text-center">
          <p className="font-semibold text-base sm:text-lg md:text-2xl">Blog genzet</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold my-2 leading-tight md:leading-tight break-words">
            The Journal: Design Resources, Interviews, and Industry News
          </h1>
          <p className="text-sm sm:text-base md:text-2xl">Your daily dose of design insights!</p>

          <div className="w-full max-w-2xl mx-auto mt-6 px-0 sm:px-2 flex justify-center">
            <div className="flex flex-col gap-3 md:flex-row md:gap-4 items-stretch md:items-center w-full md:w-auto">
              <ArticleFilters onFilterChange={handleFilterChange} />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-screen-lg mx-auto px-1 sm:px-2 md:px-0">
        <ArticleList filters={filters} />
      </div>
    </div>
  );
}
