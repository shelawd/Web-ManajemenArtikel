'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios'; // Gunakan instance axios yang sudah dikonfigurasi
import ArticleCard from './ArticleCard';
import AppPagination from '@/components/shared/AppPagination';

// Definisikan tipe data untuk artikel
type Article = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  category: {
    name: string;
  };
  imageUrl?: string;
};

interface ArticleListProps {
  filters: {
    category: string;
    search: string;
  };
}

export default function ArticleList({ filters }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const articlesPerPage = 9; //Jumlah artikel per halaman

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/articles', {
          params: {
            search: filters.search,
            categoryId: filters.category,
            page: currentPage, 
            limit: articlesPerPage, 
          },
        });
        setArticles(response.data.data);
        setTotalArticles(response.data.total);
      } catch (err) {
        setError('Failed to fetch articles. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [filters, currentPage]); 

  const totalPages = Math.ceil(totalArticles / articlesPerPage);

  if (isLoading) {
    return <div>Loading articles...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <p className="mb-6 text-muted-foreground">
        Showing: {articles.length} of {totalArticles} articles
      </p>
      
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold">No Articles Found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter.</p>
        </div>
      )}
      
      {/* Di sini Anda bisa menambahkan komponen Pagination */}
      <AppPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}