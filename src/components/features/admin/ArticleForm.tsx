'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UploadCloud, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import LexicalEditor from './LexicalEditor';

// Schema Zod dengan validasi yang lebih aman
const articleSchema = z.object({
  title: z.string().min(5, { message: "Please enter a title with at least 5 characters" }),
  categoryId: z.string().min(1, { message: "Please select a category" }),
  content: z.string().min(20, { message: "Content must be at least 20 characters" }),
  thumbnail: z
    .any()
    .optional()
    .refine(file => !file || file instanceof File, {
      message: "Please select a valid picture",
    }),
});

type ArticleFormData = z.infer<typeof articleSchema>;

const categories = [
  { id: 'tech-1', name: 'Technology' },
  { id: 'design-1', name: 'Design' },
  { id: 'dev-1', name: 'Development' },
];

interface ArticleFormProps {
  onSubmit: (data: ArticleFormData) => void;
  isSubmitting?: boolean;
}

export default function ArticleForm({ onSubmit, isSubmitting = false }: ArticleFormProps) {
  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      categoryId: '',
      content: '',
      thumbnail: undefined,
    },
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [lexicalJSON, setLexicalJSON] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync lexicalJSON ke form.content jika lexicalJSON berubah dan panjangnya valid
  useEffect(() => {
    if (lexicalJSON.length >= 20) {
      form.setValue('content', lexicalJSON, { shouldValidate: true });
    }
  }, [lexicalJSON, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      form.setValue('thumbnail', file, { shouldValidate: true });
    } else {
      setPreviewImage(null);
      form.setValue('thumbnail', undefined, { shouldValidate: true });
    }
  };

  const handleChangeThumbnail = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteThumbnail = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    form.setValue('thumbnail', undefined, { shouldValidate: true });
  };

  const handleFormSubmit = (data: ArticleFormData) => {
    console.log("Submitting form data:", data);
    const validationErrors = form.formState.errors;
    if (Object.keys(validationErrors).length) {
      console.log("Validation errors:", validationErrors);
    }
    onSubmit(data);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/articles">
          <Button variant="outline" size="icon" type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-xl font-semibold">Create Article</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Thumbnail uploader */}
          <FormField
            control={form.control}
            name="thumbnail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail</FormLabel>
                <FormControl>
                  <div
                    className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col justify-center items-center cursor-pointer relative"
                    onClick={handleChangeThumbnail}
                  >
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      accept="image/jpeg, image/png"
                      ref={fileInputRef}
                    />
                    {previewImage ? (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <img src={previewImage} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                        <div className="flex gap-4 mt-2">
                          <button
                            type="button"
                            className="text-blue-600 underline"
                            onClick={handleChangeThumbnail}
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            className="text-red-600 underline"
                            onClick={handleDeleteThumbnail}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-12 h-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Click to select files</p>
                        <p className="text-xs text-gray-500">Supported file types: jpg, png</p>
                      </>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue="">
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Content */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <LexicalEditor
                    onChange={(json, text) => {
                      setLexicalJSON(json);
                      field.onChange(text);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button>Preview</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
