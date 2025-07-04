"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UploadCloud, ArrowLeft } from "lucide-react";
import Link from "next/link";
import LexicalEditor from "./LexicalEditor";
import api from "@/lib/axios";

const articleSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Please enter a title with at least 5 characters" }),
  categoryId: z.string().min(1, { message: "Please select a category" }),
  content: z
    .string()
    .min(20, { message: "Content must be at least 20 characters" }),
  thumbnail: z
    .any()
    .optional()
    .refine((file) => !file || file instanceof File, {
      message: "Please select a valid picture",
    }),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface Category {
  id: string;
  name: string;
}

interface ArticleFormProps {
  isSubmitting?: boolean;
}

interface ArticleFormProps {
  isSubmitting?: boolean;
  initialData?: any; // 1. Terima data awal
  onSubmit: (data: any) => void;
}


export default function ArticleForm({
  isSubmitting = false,
  initialData,          // 1. Terima data awal
  onSubmit,             // Terima fungsi submit dari parent
}: ArticleFormProps) {
  const router = useRouter();
  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    // Kita akan set defaultValues melalui useEffect
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [lexicalJSON, setLexicalJSON] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        content: initialData.content,
        categoryId: initialData.categoryId,
      });
      // Set pratinjau gambar jika ada
      if (initialData.thumbnailUrl) {
        setPreviewImage(initialData.thumbnailUrl);
      }
    }
  }, [initialData, form]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await api.get("/categories");
        setCategories(response.data.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (lexicalJSON.length >= 20) {
      form.setValue("content", lexicalJSON, { shouldValidate: true });
    }
  }, [lexicalJSON, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      form.setValue("thumbnail", file, { shouldValidate: true });
    } else {
      setPreviewImage(null);
      form.setValue("thumbnail", undefined, { shouldValidate: true });
    }
  };

   const handleFormSubmit = async (data: ArticleFormData) => {
    // Logika upload gambar tetap sama, hasilnya digabung ke data
    let imageUrl = initialData?.thumbnailUrl || ''; // Gunakan gambar lama jika tidak ada yg baru
    if (data.thumbnail && data.thumbnail instanceof File) {
      // ... (logika upload gambar Anda)
      // Setelah upload, `imageUrl` akan diisi dengan URL baru
      const imageFormData = new FormData();
      imageFormData.append('image', data.thumbnail);
      const token = localStorage.getItem("access_token");
      try {
        const uploadResponse = await api.post("/upload", imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
        });
        imageUrl = uploadResponse.data.url;
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload new image.");
        return;
      }
    }
    
    // Gabungkan semua data untuk dikirim ke parent
    const finalData = {
      ...data,
      imageUrl: imageUrl,
    };
    
    // Hapus field thumbnail karena tidak dibutuhkan di payload API
    delete finalData.thumbnail;

    onSubmit(finalData); // Kirim data final ke fungsi handleUpdateArticle atau handleCreateArticle
  };

  const handleChangeThumbnail = () => fileInputRef.current?.click();

  const handleDeleteThumbnail = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    form.setValue("thumbnail", undefined, { shouldValidate: true });
  };

  const handleCreateArticle = async (data: ArticleFormData) => {
    let imageUrl = "";
    if (data.thumbnail && data.thumbnail instanceof File) {
      try {
        const imageFormData = new FormData();
        imageFormData.append("image", data.thumbnail);
        const token = localStorage.getItem("access_token");
        const uploadResponse = await api.post("/upload", imageFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        imageUrl = uploadResponse.data.url;
      } catch (error) {
        console.error("Error uploading image:", error);
        return;
      }
    }

    try {
      const token = localStorage.getItem("access_token");
      const articlePayload = {
        title: data.title,
        content: data.content,
        categoryId: data.categoryId,
        imageUrl: imageUrl,
      };
      await api.post("/articles", articlePayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Artikel berhasil dibuat!");
      router.push('/admin/articles');
    } catch (error: any) {
      console.error("Error creating article:", error);
      if (error.response) {
        alert(
          `Gagal membuat artikel: ${JSON.stringify(
            error.response.data.error || error.response.data.message
          )}`
        );
      }
    }
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
        <form
          onSubmit={form.handleSubmit(handleCreateArticle)}
          className="space-y-8"
        >
          {/* Thumbnail Uploader */}
          <FormField
            control={form.control}
            name="thumbnail"
            render={() => (
              <FormItem>
                <FormLabel>Thumbnail</FormLabel>
                <FormControl>
                  <div
                    className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col justify-center items-center cursor-pointer relative"
                    // PERBAIKAN: onClick hanya aktif jika tidak ada gambar pratinjau
                    onClick={!previewImage ? handleChangeThumbnail : undefined}
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
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="flex gap-4 mt-2">
                          <button
                            type="button"
                            className="text-blue-600 underline"
                            // PERBAIKAN: event click pada tombol ini tidak lagi konflik
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChangeThumbnail();
                            }}
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            className="text-red-600 underline"
                            // PERBAIKAN: event click pada tombol ini tidak lagi konflik
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteThumbnail();
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-12 h-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Click to select files
                        </p>
                        <p className="text-xs text-gray-500">
                          Supported file types: jpg, png
                        </p>
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
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue=""
                >
                  <FormControl>
                    <SelectTrigger disabled={isLoadingCategories}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories
                      .filter((category) => category.id && category.id !== "")
                      .map((category) => (
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button>Preview</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}