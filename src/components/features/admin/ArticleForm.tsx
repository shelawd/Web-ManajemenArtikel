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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadCloud, ArrowLeft, Eye, CheckCircle, X } from "lucide-react";
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
  initialData?: any;
  onSubmit: (data: any) => void;
  mode: 'create' | 'edit';
}

interface PreviewData {
  title: string;
  content: string;
  categoryName: string;
  thumbnailUrl: string | null;
}

export default function ArticleForm({
  isSubmitting = false,
  initialData,
  onSubmit,
  mode,
}: ArticleFormProps) {
  const router = useRouter();
  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [lexicalJSON, setLexicalJSON] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with initial data for edit mode
  useEffect(() => {
    if (initialData && mode === 'edit') {
      form.reset({
        title: initialData.title || "",
        categoryId: initialData.categoryId || "",
        content: initialData.content || "",
      });
      
      if (initialData.thumbnailUrl) {
        setPreviewImage(initialData.thumbnailUrl);
      }
      
      if (initialData.content) {
        setLexicalJSON(initialData.content);
      }
    }
  }, [initialData, form, mode]);

  // Fetch categories
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

  // Update content when LexicalEditor changes
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

  const handlePreview = () => {
    const formData = form.getValues();
    const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
    
    setPreviewData({
      title: formData.title,
      content: formData.content,
      categoryName: selectedCategory?.name || "",
      thumbnailUrl: previewImage,
    });
    setShowPreview(true);
  };

  const handleFormSubmit = async (data: ArticleFormData) => {
    let imageUrl = initialData?.thumbnailUrl || '';
    
    if (data.thumbnail && data.thumbnail instanceof File) {
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
    
    const finalData = {
      ...data,
      imageUrl: imageUrl,
    };
    
    delete finalData.thumbnail;

    try {
      await onSubmit(finalData);
      
      // Show success message
      setSuccessMessage(mode === 'create' ? 'Article created successfully!' : 'Article updated successfully!');
      setShowSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/admin/articles');
      }, 2000);
    } catch (error) {
      console.error("Error submitting article:", error);
    }
  };

  const handleChangeThumbnail = () => fileInputRef.current?.click();

  const handleDeleteThumbnail = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    form.setValue("thumbnail", undefined, { shouldValidate: true });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/articles">
            <Button variant="outline" size="icon" type="button">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Create Article' : 'Edit Article'}
          </h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
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
                    value={field.value ?? ""}
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
                      initialState={initialData?.content}
                      onChange={(json) => {
                        setLexicalJSON(json);
                        field.onChange(json);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreview}
                disabled={!form.formState.isValid}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                {isSubmitting ? "Processing..." : mode === 'create' ? "Create Article" : "Update Article"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Preview Dialog */}
      {showPreview && previewData && (
        <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col overflow-y-auto">
          <div className="w-full bg-white border-b flex items-center justify-end px-2 sm:px-6 py-4 sticky top-0 z-10">
            <button
              className="ml-auto p-2 rounded-full hover:bg-gray-200"
              onClick={() => setShowPreview(false)}
              aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {/* Konten Preview */}
          <div className="flex-1 flex flex-col items-center justify-start px-1 sm:px-2 pb-10">
            <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow p-2 sm:p-4 md:p-6 mt-4 sm:mt-8">
              {/* Tanggal & author */}
              <div className="text-center text-gray-500 text-xs sm:text-sm mb-2">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                {" • "} Created by Admin
              </div>
              {/* Judul */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 break-words">{previewData.title}</h1>
              {/* Gambar utama */}
              {previewData.thumbnailUrl && (
                <img
                  src={previewData.thumbnailUrl}
                  alt="Preview"
                  className="rounded-xl w-full object-cover aspect-video max-h-72 sm:max-h-96 mb-6 mx-auto"
                />
              )}
              {/* Konten Artikel (plain text) */}
              <div className="mx-auto mb-8 break-words overflow-x-auto whitespace-pre-line text-base text-gray-800">
                {lexicalJsonToPlainText(previewData.content)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Success
            </DialogTitle>
          </DialogHeader>
          <p className="text-center py-4">{successMessage}</p>
          <div className="flex justify-center">
            <Button onClick={() => router.push('/admin/articles')}>
              Go to Articles
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Tambahkan fungsi utilitas di luar komponen
function lexicalJsonToPlainText(jsonString: string): string {
  try {
    const json = JSON.parse(jsonString);
    if (!json.root || !Array.isArray(json.root.children)) return "";
    return json.root.children
      .map((p: any) =>
        Array.isArray(p.children)
          ? p.children.map((c: any) => c.text || "").join(" ")
          : ""
      )
      .join("\n");
  } catch {
    return jsonString;
  }
}