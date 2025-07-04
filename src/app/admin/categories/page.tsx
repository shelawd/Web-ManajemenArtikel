'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AppPagination from '@/components/shared/AppPagination';
import CategoryModal from '@/components/features/admin/CategoryModal';
import DeleteDialog from '@/components/features/admin/DeleteDialog';
import api from '@/lib/axios';
import { useDebounce } from '@/lib/hooks'; // Asumsi hook ini sudah ada

// Tipe data untuk kategori
type Category = {
  id: string;
  name: string;
  createdAt: string;
};

type CategoryFormData = {
  name: string;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const itemsPerPage = 10;

  // Fungsi untuk mengambil data kategori
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/categories', {
        params: {
          search: debouncedSearchTerm,
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      setCategories(response.data.data);
      setTotalCategories(response.data.total);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      // Tampilkan notifikasi error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [debouncedSearchTerm, currentPage]);

  // Handler untuk membuka modal
  const handleOpenModal = (category: Category | null = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // Handler untuk menutup modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  // Handler untuk menyimpan (Create/Update)
  const handleSaveCategory = async (data: CategoryFormData) => {
    setIsSaving(true);
    try {
      if (editingCategory) {
        // Mode Update
        await api.put(`/categories/${editingCategory.id}`, data);
      } else {
        // Mode Create
        await api.post('/categories', data);
      }
      handleCloseModal();
      fetchCategories(); // Ambil data terbaru
    } catch (error) {
      console.error("Failed to save category:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler untuk membuka dialog hapus
  const handleOpenDeleteDialog = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Handler untuk konfirmasi hapus
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      await api.delete(`/categories/${deletingCategory.id}`);
      setIsDeleteDialogOpen(false);
      setDeletingCategory(null);
      fetchCategories(); // Ambil data terbaru
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <p>Total Category : {totalCategories}</p>
            <div className="relative mt-2 max-w-sm">
              <Input
                placeholder="Search Category"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          <Button onClick={() => handleOpenModal()}>+ Add Category</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-4 justify-end">
                      <Button variant="link" className="p-0 h-auto" onClick={() => handleOpenModal(category)}>Edit</Button>
                      <Button variant="link" className="p-0 h-auto text-red-500" onClick={() => handleOpenDeleteDialog(category)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        <div className="mt-6 flex justify-center">
          <AppPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Render Modal dan Dialog */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        isSaving={isSaving}
        category={editingCategory}
      />
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteCategory}
        itemName={deletingCategory?.name || ''}
      />
    </>
  );
}
