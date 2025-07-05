'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

// Tipe data untuk kategori
type Category = {
  id: string;
  name: string;
};

// Skema validasi yang lebih ketat
const categorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Category name must be at least 2 characters long." })
    .max(50, { message: "Category name cannot exceed 50 characters." })
    .regex(/^[a-zA-Z0-9\s\-_]+$/, { 
      message: "Category name can only contain letters, numbers, spaces, hyphens, and underscores." 
    })
    .trim()
    .refine((val) => val.length > 0, { message: "Category name is required." }),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
  isSaving?: boolean;
  category?: Category | null; // Jika ada, berarti mode edit
}

export default function CategoryModal({ isOpen, onClose, onSave, isSaving, category }: CategoryModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
    },
    mode: 'onChange', // Enable real-time validation
  });

  // Set nilai form jika dalam mode edit
  useEffect(() => {
    if (category) {
      form.reset({ name: category.name });
    } else {
      form.reset({ name: '' });
    }
    // Clear any previous error/success messages
    setErrorMessage(null);
    setShowSuccess(false);
  }, [category, form, isOpen]);

  const modalTitle = category ? 'Edit Category' : 'Create Category';
  const modalDescription = category 
    ? 'Update the category name. Changes will be applied immediately.' 
    : 'Create a new category for organizing your articles.';

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      setErrorMessage(null);
      await onSave(data);
      setShowSuccess(true);
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 
        error.message || 
        'Failed to save category. Please try again.'
      );
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setErrorMessage(null);
      setShowSuccess(false);
      form.reset();
      onClose();
    }
  };

  const isFormValid = form.formState.isValid && form.getValues('name').trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {modalTitle}
          </DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>

        {/* Success Message */}
        {showSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {category ? 'Category updated successfully!' : 'Category created successfully!'}
            </span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Technology, Design, Business" 
                      {...field}
                      disabled={isSaving}
                      className={form.formState.errors.name ? 'border-red-500' : ''}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500">
                    Use descriptive names that help organize your articles.
                  </p>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving || !isFormValid}
                className="min-w-[80px]"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  category ? 'Update' : 'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
