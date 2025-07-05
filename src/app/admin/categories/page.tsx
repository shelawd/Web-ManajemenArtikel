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
import { useDebounce } from '@/lib/hooks'; 
import { Plus, Search, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = {
  id: string;
  name: string;
  createdAt: string;
  _isFallback?: boolean;
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

  // Success and error messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState('all');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const itemsPerPage = 10;

  // Fungsi untuk mengambil data kategori
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const categoryParam = selectedCategory === "all" ? "" : selectedCategory;
      const response = await api.get('/categories', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: debouncedSearchTerm,
          category: categoryParam,
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      
      // Pastikan data adalah array
      if (!Array.isArray(response.data.data)) {
        setErrorMessage("Invalid data format received from server.");
        return;
      }
      
      // Validasi dan pastikan setiap category memiliki ID yang valid
      const categoriesWithIds = response.data.data.map((category: any, index: number) => {
        if (!category) {
          return null;
        }
        
        if (!category.id || category.id.toString().trim() === '') {
          return null;
        }
        
        if (!category.name) {
          return null;
        }
        
        return category;
      }).filter(Boolean); // Remove null values
      
      // Jika semua category tidak valid, coba gunakan fallback
      if (categoriesWithIds.length === 0 && response.data.data.length > 0) {
        const fallbackCategories = response.data.data.map((category: any, index: number) => {
          const fallbackId = category.userId || `temp-${index}`;
          
          return {
            ...category,
            id: fallbackId,
            _isFallback: true // Flag untuk menandai ini adalah fallback
          };
        });
        
        setCategories(fallbackCategories);
      } else {
        setCategories(categoriesWithIds);
      }
      
      setTotalCategories(response.data.total);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 
        'Failed to load categories. Please refresh the page.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [debouncedSearchTerm, currentPage]);

  // Clear messages after a delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

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

  // Handler untuk menyimpan kategori
  const handleSaveCategory = async (data: CategoryFormData) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      
      if (editingCategory) {
        // Update existing category
        await api.put(`/categories/${editingCategory.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage(`Category "${data.name}" updated successfully!`);
      } else {
        // Create new category
        await api.post('/categories', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage(`Category "${data.name}" created successfully!`);
      }
      
      handleCloseModal();
      fetchCategories(); // Refresh the list
    } catch (error: any) {
      throw error; // Re-throw to let the modal handle the error display
    } finally {
      setIsSaving(false);
    }
  };

  // Fungsi untuk membuka dialog delete
  const handleOpenDeleteDialog = (category: Category) => {
    // Validasi data category sebelum membuka dialog
    if (!category) {
      setErrorMessage("Category data is missing. Please refresh the page.");
      return;
    }
    
    if (typeof category !== 'object') {
      setErrorMessage("Invalid category data type. Please refresh the page.");
      return;
    }
    
    if (!category.id || category.id.toString().trim() === '') {
      setErrorMessage("Category ID is missing or invalid. Please refresh the page.");
      return;
    }
    
    // Pastikan ID bukan undefined, null, atau string kosong
    const categoryId = category.id.toString().trim();
    if (categoryId === 'undefined' || categoryId === 'null') {
      setErrorMessage("Invalid category ID format. Please refresh the page.");
      return;
    }
    
    if (!category.name) {
      setErrorMessage("Category name is missing. Please refresh the page.");
      return;
    }
    
    setDeletingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Fungsi untuk menutup dialog delete
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeletingCategory(null);
  };

  // Fungsi untuk mengeksekusi delete menggunakan DELETE /categories/{id}
  const handleDeleteCategory = async () => {
    if (!deletingCategory) {
      return;
    }
    
    if (!deletingCategory.id) {
      throw new Error("Category ID is missing. Please try again.");
    }
    
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }
      
      // Pastikan ID category valid dan terformat dengan benar
      const categoryId = deletingCategory.id.toString().trim();
      if (!categoryId || categoryId === 'undefined' || categoryId === 'null') {
        throw new Error("Invalid category ID format.");
      }
      
      // Jika menggunakan fallback ID, berikan peringatan
      if (deletingCategory._isFallback) {
        const shouldContinue = confirm(
          "Warning: This category is using a temporary ID. The delete operation might not work correctly. Do you want to continue?"
        );
        if (!shouldContinue) {
          return;
        }
      }
      
      const deleteUrl = `/categories/${categoryId}`;
      
      // Kirim request DELETE ke endpoint yang benar
      const response = await api.delete(deleteUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      setSuccessMessage(`Category "${deletingCategory.name}" deleted successfully!`);
      handleCloseDeleteDialog();
      fetchCategories(); // Refresh the list
      
    } catch (error: any) {
      // Berikan pesan error yang spesifik berdasarkan status code
      if (error.response?.status === 404) {
        if (deletingCategory._isFallback) {
          throw new Error(`Category "${deletingCategory.name}" not found. This might be due to using a temporary ID. Please refresh the page and try again.`);
        } else {
          throw new Error(`Category "${deletingCategory.name}" not found. It may have been already deleted.`);
        }
      } else if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please login again.");
      } else if (error.response?.status === 403) {
        throw new Error("You don't have permission to delete this category.");
      } else if (error.response?.status === 400) {
        throw new Error(`Bad request: ${error.response?.data?.message || 'Invalid request format'}`);
      } else if (error.response?.status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(`Failed to delete category: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  return (
    <>
      <div className="bg-white w-full p-2 sm:p-4 md:p-6 rounded-lg shadow-sm overflow-x-auto">
        {/* Header: Total Category */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Articles</h1>
            <p className="text-gray-600">Total Category: {totalCategories}</p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
          >
            + Add Articles
          </Button>
        </div>

        {/* Filter Bar: Select Category + Search */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-stretch md:items-center mb-6 w-full">
          {/* Select Category */}
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Search */}
          <Input
            placeholder="Search by title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[120px] md:min-w-[200px]"
          />
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800 mb-4">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 mb-4">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        {/* Table */}
        <div className="w-full">
        <Table className="min-w-[400px] sm:min-w-[600px] md:min-w-[800px] text-xs">
          <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-xs min-w-[120px]">Category</TableHead>
                <TableHead className="font-semibold text-xs min-w-[120px]">Created At</TableHead>
                <TableHead className="text-right font-semibold text-xs min-w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600 text-xs">Loading categories...</span>
                    </div>
                  </TableCell>
              </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-xs">
                    <div className="text-gray-500 text-xs">
                      {searchTerm ? 'No categories found matching your search.' : 'No categories found.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category, index) => (
                  <TableRow key={category.id} className="hover:bg-gray-50 text-xs">
                    <TableCell className="truncate break-words max-w-[120px] text-xs">
                      {category.name}
                      {category._isFallback && (
                        <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Fallback ID
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600 text-xs whitespace-nowrap">
                      {new Date(category.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right text-xs whitespace-nowrap">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOpenModal(category)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            handleOpenDeleteDialog(category);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                          disabled={category._isFallback}
                          title={category._isFallback ? "Cannot delete category with temporary ID" : ""}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        </div>
        
        {/* Pagination: Previous & Next Only */}
        <div className="mt-6 flex justify-center">
          <AppPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        isSaving={isSaving}
        category={editingCategory}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteCategory}
        itemName={deletingCategory?.name || ''}
        itemType="category"
      />
    </>
  );
}
