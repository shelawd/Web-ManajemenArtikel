'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/lib/hooks';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/axios';

interface Category {
  id: string;
  name: string;
}

interface ArticleFiltersProps {
  onFilterChange: (filters: { category: string; search: string }) => void;
}

export default function ArticleFilters({ onFilterChange }: ArticleFiltersProps) {
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    async function fetchCategories() {
      setLoadingCategories(true);
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data || []);
      } catch {
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    onFilterChange({ category, search: debouncedSearchTerm });
  }, [category, debouncedSearchTerm, onFilterChange]);

  return (
    <div className="flex gap-4 items-center bg-[#3B82F6] px-3 py-3 rounded-xl">
      <Select onValueChange={setCategory} value={category} disabled={loadingCategories}>
        <SelectTrigger className="w-[180px] bg-white text-black">
          <SelectValue placeholder={loadingCategories ? "Loading..." : "Select category"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {loadingCategories ? (
            <div className="px-4 py-2 text-gray-400 text-sm">Loading categories...</div>
          ) : (
            categories.filter(cat => cat.id && cat.id !== "").map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <Input
        type="search"
        placeholder="Search articles..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-grow bg-white text-black"
      />
    </div>
  );
}