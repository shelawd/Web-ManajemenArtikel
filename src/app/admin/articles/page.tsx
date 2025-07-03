'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ArticleFilters from "@/components/features/articles/ArticleFilters";
import AppPagination from "@/components/shared/AppPagination";
import { useState } from "react";
import Link from 'next/link';

// Mock data, ganti dengan data dari API Anda
const mockArticles = [
  { id: 1, title: 'Cybersecurity Essentials Every Developer Should Know', category: 'Technology', createdAt: 'April 13, 2025 10:55:12' },
  { id: 2, title: 'The Future of Work: Remote-First Teams and Digital Tools', category: 'Technology', createdAt: 'April 13, 2025 10:55:12' },
  // ...tambahkan data lain
];

export default function AdminArticlesPage() {
  const [filters, setFilters] = useState({ category: '', search: '' });
  
  // Ganti dengan state dari API
  const totalArticles = 25; 
  const currentPage = 1;
  const totalPages = 3;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <p>Total Articles : {totalArticles}</p>
        <div className="flex items-center gap-4">
          <ArticleFilters onFilterChange={setFilters} />
          <Button asChild>
            <Link href="/admin/articles/create">+ Add Articles</Link>
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Thumbnails</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Created at</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockArticles.map((article) => (
            <TableRow key={article.id}>
              <TableCell>
                <div className="w-16 h-10 bg-gray-200 rounded">
                  <img src={`https://picsum.photos/seed/${article.id}/160/100`} alt={article.title} className="w-full h-full object-cover rounded" />
                </div>
              </TableCell>
              <TableCell className="font-medium">{article.title}</TableCell>
              <TableCell>{article.category}</TableCell>
              <TableCell>{article.createdAt}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button variant="link" className="p-0 h-auto">Preview</Button>
                  <Button variant="link" className="p-0 h-auto">Edit</Button>
                  <Button variant="link" className="p-0 h-auto text-red-500">Delete</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-6 flex justify-center">
        <AppPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={() => {}}
        />
      </div>
    </div>
  );
}