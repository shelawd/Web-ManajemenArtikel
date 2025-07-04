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
  const [filters, setFilters] = useState({ category: "", search: "" });
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // PERBAIKAN: Tambahkan state untuk visibilitas dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  const totalArticles = articles.length;

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const response = await api.get("/articles", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setArticles(response.data.data || []);
      } catch (error) {
        console.error("Gagal mengambil data artikel:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // PERBAIKAN: Fungsi untuk membuka dialog
  const handleOpenDeleteDialog = (article: Article) => {
    setArticleToDelete(article);
    setIsDialogOpen(true);
  };

  // PERBAIKAN: Fungsi untuk menutup dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setArticleToDelete(null);
  };
  
  // PERBAIKAN: Fungsi delete yang dipanggil oleh dialog
  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;

    try {
      const token = localStorage.getItem("access_token");
      await api.delete(`/articles/${articleToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setArticles((prevArticles) =>
        prevArticles.filter((article) => article.id !== articleToDelete.id)
      );
    } catch (error) {
      console.error("Failed to delete article:", error);
      alert("Failed to delete article. Please try again.");
    } finally {
      handleCloseDialog();
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <p className="text-sm md:text-base font-semibold">
          Total Articles: {totalArticles}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <ArticleFilters onFilterChange={setFilters} />
          <Button asChild>
            <Link href="/admin/articles/create">+ Add Articles</Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p>Loading articles...</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[600px] md:min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[80px]">Thumbnails</TableHead>
                <TableHead className="min-w-[150px]">Title</TableHead>
                <TableHead className="min-w-[120px]">Category</TableHead>
                <TableHead className="min-w-[160px]">Created at</TableHead>
                <TableHead className="text-right min-w-[140px]">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="w-12 h-8 md:w-16 md:h-10 bg-gray-200 rounded overflow-hidden">
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
                  <TableCell className="font-medium max-w-[150px] md:max-w-none truncate">
                    {article.title}
                  </TableCell>
                  <TableCell className="max-w-[120px] truncate">
                    {article.category?.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm md:text-base">
                    {new Date(article.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end flex-wrap">
                      <Button
                        variant="link"
                        className="p-0 h-auto text-xs md:text-sm"
                      >
                        Preview
                      </Button>
                      <Button
                        asChild
                        variant="link"
                        className="p-0 h-auto text-blue-600 text-xs md:text-sm"
                      >
                        <Link href={`/admin/articles/edit/${article.id}`}>
                          Edit
                        </Link>
                      </Button>
                      {/* PERBAIKAN: Pemanggilan onClick untuk membuka dialog */}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-red-500 text-xs md:text-sm"
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
      
      {/* PERBAIKAN: Panggil komponen DeleteDialog dengan props yang benar */}
      <DeleteDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleDeleteArticle}
        itemName={articleToDelete?.title || ""}
      />
    </div>
  );
}