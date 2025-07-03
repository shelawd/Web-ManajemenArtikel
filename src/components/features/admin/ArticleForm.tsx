'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UploadCloud, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import LexicalEditor from './LexicalEditor'; // Import editor baru

// Skema validasi menggunakan Zod
const articleSchema = z.object({
  title: z.string().min(5, { message: "Judul minimal 5 karakter." }),
  categoryId: z.string({ required_error: "Kategori harus dipilih." }),
  // Kita akan memvalidasi konten teksnya, bukan JSON state dari Lexical
  content: z.string().min(20, { message: "Konten minimal 20 karakter." }),
  thumbnail: z.any().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

// Mock data kategori, ganti dengan data dari API Anda
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
      categoryId: undefined,
      content: '',
    },
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // State untuk menyimpan JSON dari Lexical, yang akan dikirim ke API
  const [lexicalJSON, setLexicalJSON] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      form.setValue('thumbnail', file);
    }
  };

  const handleFormSubmit = (data: ArticleFormData) => {
    // Gabungkan data form dengan state JSON dari Lexical
    const submissionData = { ...data, content: lexicalJSON };
    onSubmit(submissionData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/articles">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-xl font-semibold">Create Articles</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Uploader Thumbnail */}
          <FormField
            control={form.control}
            name="thumbnail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnails</FormLabel>
                <FormControl>
                  <div className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col justify-center items-center cursor-pointer relative">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/jpeg, image/png" />
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <UploadCloud className="w-12 h-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Click to select files</p>
                        <p className="text-xs text-gray-500">Support File Type: jpg or png</p>
                      </>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Judul */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Input title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Kategori */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">The existing category list can be seen in the <Link href="/admin/categories" className="text-blue-600 underline">category</Link> menu</p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Konten (Lexical Editor) */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <LexicalEditor onChange={(json, text) => {
                    // Set state JSON untuk dikirim ke API
                    setLexicalJSON(json);
                    // Set state teks untuk validasi oleh Zod
                    field.onChange(text);
                  }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="button" variant="secondary">Preview</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
