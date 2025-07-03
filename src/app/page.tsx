'use client';
import { useState, useCallback } from "react"; 
import ArticleFilters from "@/components/features/articles/ArticleFilters";
import ArticleList from "@/components/features/articles/ArticleList";

export default function Home() {
  const [filters, setFilters] = useState({ category: '', search: '' });

  const handleFilterChange = useCallback((newFilters: { category: string; search: string }) => {
    setFilters(newFilters);
  }, []); 

  return (
    <div className="container mx-auto">
      <div className="text-center my-8 bg-blue-600 p-12 rounded-lg text-white">
        <p>Blog genzet</p>
        <h1 className="text-4xl md:text-5xl font-bold my-2">The Journal: Design Resources, Interviews, and Industry News</h1>
        <p className="text-lg">Your daily dose of design insights!</p>
        
        {/* filter dan search bar */}
        <div className="max-w-2xl mx-auto mt-6">
          <ArticleFilters onFilterChange={handleFilterChange} />
        </div>
      </div>

      {/* Komponen untuk menampilkan daftar artikel berdasarkan filter */}
      <ArticleList filters={filters} />
    </div>
  );
}