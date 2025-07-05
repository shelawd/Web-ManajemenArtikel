"use client";

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
import DeleteDialog from "@/components/features/admin/DeleteDialog";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ArticleForm from "@/components/features/admin/ArticleForm";
import { X } from "lucide-react";

type Category = {
  id: string;
  name: string;
};

type Article = {
  id: string;
  title: string;
  content: string;
  category: {
    id: string;
    name: string;
  };
  createdAt: string;
  thumbnailUrl?: string;
};

export default function ArticlesListPage() {
  const [filters, setFilters] = useState({ search: "" });
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);
  const itemsPerPage = 10;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);

  // Fetch categories for select
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await api.get("/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data.data || []);
        setTotalCategories(response.data.total || 0);
      } catch (error) {
        setCategories([]);
        setTotalCategories(0);
      }
    };
    fetchCategories();
  }, []);

  // Fetch articles with filters and pagination
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const categoryParam = selectedCategory === "all" ? "" : selectedCategory;
        const response = await api.get("/articles", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            category: categoryParam,
            search: filters.search,
            page: currentPage,
            limit: itemsPerPage,
          },
        });
        setArticles(response.data.data || []);
        setTotalArticles(response.data.total || 0);
        setTotalPages(Math.ceil((response.data.total || 1) / itemsPerPage));
      } catch (error) {
        setArticles([]);
        setTotalArticles(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, [filters, currentPage, selectedCategory]);

  // Delete dialog logic
  const handleOpenDeleteDialog = (article: Article) => {
    setArticleToDelete(article);
    setIsDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setArticleToDelete(null);
  };
  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;
    try {
      const token = localStorage.getItem("access_token");
      await api.delete(`/articles/${articleToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles((prev) => prev.filter((a) => a.id !== articleToDelete.id));
    } catch (error) {
      alert("Failed to delete article. Please try again.");
    } finally {
      handleCloseDialog();
    }
  };

  // Filter bar: select + search
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
    setCurrentPage(1);
  };

  // Handler untuk preview
  const handlePreviewArticle = (article: Article) => {
    setPreviewArticle(article);
  };
  const handleClosePreview = () => {
    setPreviewArticle(null);
  };

  return (
    <div className="bg-white w-full p-2 sm:p-4 md:p-6 rounded-lg shadow-sm overflow-x-auto">
      {/* Total Articles */}
      <div className="mb-2">
        <span className="text-xs sm:text-sm md:text-base font-semibold">
          Total Articles: {totalArticles}
        </span>
      </div>
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-6 items-stretch md:items-center w-full">
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full md:w-[180px] bg-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories
              .filter((cat) => cat.id && cat.id !== "")
              .map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Input
          type="search"
          placeholder="Search by title"
          value={filters.search}
          onChange={handleSearchChange}
          className="flex-1 min-w-[120px] md:min-w-[200px]"
        />
        <Button asChild className="w-full md:w-auto">
          <Link href="/admin/articles/create">+ Add Articles</Link>
        </Button>
      </div>
      {/* Table */}
      {isLoading ? (
        <p>Loading articles...</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[600px] sm:min-w-[700px] md:min-w-[900px] text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[70px] text-xs">Thumbnails</TableHead>
                <TableHead className="min-w-[100px] sm:min-w-[150px] text-xs">Title</TableHead>
                <TableHead className="min-w-[80px] sm:min-w-[120px] text-xs">Category</TableHead>
                <TableHead className="min-w-[120px] sm:min-w-[160px] text-xs">Created at</TableHead>
                <TableHead className="text-right min-w-[100px] sm:min-w-[140px] text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="w-10 h-7 sm:w-12 sm:h-8 md:w-16 md:h-10 bg-gray-200 rounded overflow-hidden">
                      <img
                        src={
                          article.thumbnailUrl ||
                          `https://picsum.photos/seed/${article.id}/160/100`
                        }
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[80px] sm:max-w-[150px] md:max-w-none truncate break-words text-xs">
                    {article.title}
                  </TableCell>
                  <TableCell className="max:max-w-[120px] truncate break-words text-xs">
                    {article.category?.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {new Date(article.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <div className="flex gap-2 justify-end flex-wrap">
                      <Button variant="link" className="p-0 h-auto text-xs" onClick={() => handlePreviewArticle(article)}>
                        Preview
                      </Button>
                      <Button asChild variant="link" className="p-0 h-auto text-blue-600 text-xs">
                        <Link href={`/admin/articles/edit/${article.id}`}>Edit</Link>
                      </Button>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-red-500 text-xs"
                        onClick={() => handleOpenDeleteDialog(article)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <AppPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
      <DeleteDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleDeleteArticle}
        itemName={articleToDelete?.title || ""}
      />
      {/* Preview Modal */}
      {previewArticle && (
        <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col overflow-y-auto">
          <div className="w-full bg-white border-b flex items-center justify-end px-2 sm:px-6 py-4 sticky top-0 z-10">
            <button
              className="ml-auto p-2 rounded-full hover:bg-gray-200"
              onClick={handleClosePreview}
              aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-start px-1 sm:px-2 pb-10">
            <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow p-2 sm:p-4 md:p-6 mt-4 sm:mt-8">
              <div className="text-center text-gray-500 text-xs sm:text-sm mb-2">
                {new Date(previewArticle.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                {" • "} Created by Admin
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 break-words">{previewArticle.title}</h1>
              {previewArticle.thumbnailUrl && (
                <img
                  src={previewArticle.thumbnailUrl}
                  alt="Preview"
                  className="rounded-xl w-full object-cover aspect-video max-h-72 sm:max-h-96 mb-6 mx-auto"
                />
              )}
              <div className="prose prose-sm sm:prose lg:prose-lg mx-auto mt-8 break-words overflow-x-auto" style={{ wordBreak: 'break-word' }}>
                {isProbablyHtml(previewArticle.content) ? (
                  <div dangerouslySetInnerHTML={{ __html: previewArticle.content }} />
                ) : (
                  <div>{previewArticle.content}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function isProbablyHtml(str: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(str);
}