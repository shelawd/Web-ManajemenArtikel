'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/lib/hooks';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ArticleFiltersProps {
  onFilterChange: (filters: { category: string; search: string }) => void;
}

export default function ArticleFilters({ onFilterChange }: ArticleFiltersProps) {
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    onFilterChange({ category, search: debouncedSearchTerm });
  }, [category, debouncedSearchTerm, onFilterChange]);

  return (
    <div className="flex gap-4 items-center bg-[#3B82F6] px-3 py-3 rounded-xl">
      <Select onValueChange={setCategory} value={category}>
        <SelectTrigger className="w-[180px] bg-white text-black">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="technology">Technology</SelectItem>
          <SelectItem value="design">Design</SelectItem>
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