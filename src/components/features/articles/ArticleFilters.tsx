'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/lib/hooks';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ArticleFiltersProps {
  onFilterChange: (filters: { category: string; search: string }) => void;
  // Anda bisa menambahkan prop untuk daftar kategori dari server
}

export default function ArticleFilters({ onFilterChange }: ArticleFiltersProps) {
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    onFilterChange({ category, search: debouncedSearchTerm });
  }, [category, debouncedSearchTerm, onFilterChange]);

  return (
    <div className="flex gap-4 items-center">
      <Select onValueChange={setCategory} value={category}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {/* Mapping daftar kategori di sini */}
          <SelectItem value="technology">Technology</SelectItem>
          <SelectItem value="design">Design</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="search"
        placeholder="Search articles..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex-grow"
      />
    </div>
  );
}