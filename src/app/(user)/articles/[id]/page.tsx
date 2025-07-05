import api from '@/lib/axios';
import Image from 'next/image';

// --- PERBAIKAN DI SINI ---
// Tipe 'params' sekarang adalah Promise yang akan menghasilkan objek { id: string }
type ArticleDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

type Article = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  image?: string;
  user?: { username?: string };
  categoryId?: string;
  category?: { name?: string };
};

// Fungsi untuk mengambil data artikel tunggal berdasarkan ID
async function getArticleDetail(id: string) {
  try {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  } catch (error) {
    return null;
  }
}

// Fungsi untuk mengambil artikel lain (maks 3, kategori sama, exclude current)
async function getOtherArticles(categoryId: string, excludeId: string) {
  try {
    const response = await api.get('/articles', {
      params: { categoryId }
    });
    // Filter out current article, ambil max 3
    return (response.data.data || []).filter((a: any) => a.id !== excludeId).slice(0, 3);
  } catch {
    return [];
  }
}

// Tambahkan fungsi utilitas di luar komponen
function extractPlainText(content: string, maxLength = 100): string {
  // Coba parse sebagai JSON (Lexical)
  try {
    const json = JSON.parse(content);
    if (json.root && Array.isArray(json.root.children)) {
      const text = json.root.children
        .map((p: any) =>
          Array.isArray(p.children)
            ? p.children.map((c: any) => c.text || '').join(' ')
            : ''
        )
        .join(' ');
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }
  } catch {}
  // Jika HTML, hapus tag
  if (typeof window !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = content;
    const text = div.textContent || div.innerText || '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  } else {
    // SSR fallback: hapus tag pakai regex
    const text = content.replace(/<[^>]+>/g, '');
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  // Penggunaan 'await' di sini sudah benar dan sekarang cocok dengan tipenya
  const { id } = await params;
  const article: Article | null = await getArticleDetail(id);
  
  if (!article) {
    return <div className="text-center py-20 text-lg">Artikel tidak ditemukan.</div>;
  }

  const otherArticles: Article[] = article.categoryId
    ? await getOtherArticles(article.categoryId, article.id)
    : [];

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Header Artikel */}
      <div className="max-w-3xl mx-auto text-center mb-8">
        <div className="text-sm text-gray-500 mb-2">
          {new Date(article.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} 
          {" • "} Created by {article.user?.username || "Admin"}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
      </div>

      {/* Gambar utama */}
      <div className="max-w-3xl mx-auto mb-8">
        {article.image ? (
          <Image
            src={article.image}
            alt={article.title}
            width={800}
            height={400}
            className="rounded-xl w-full object-cover aspect-video"
          />
        ) : (
          <div className="aspect-video bg-gray-200 rounded-xl" />
        )}
      </div>

      {/* Konten Artikel */}
      <div className="max-w-3xl mx-auto prose prose-lg mb-16">
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>

      {/* Other Articles */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Other articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherArticles.map((a: any) => (
            <div key={a.id} className="bg-white rounded-xl shadow p-4 flex flex-col">
              <div className="w-full h-40 relative mb-3 rounded-lg overflow-hidden">
                {a.image ? (
                  <Image 
                  src={a.image || `https://picsum.photos/seed/${a.id}/400/225`} 
                  alt={a.title} 
                  fill 
                  className="object-cover" 
                />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
              <div className="text-xs text-gray-500 mb-1">
                {new Date(a.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="font-semibold text-base mb-1 line-clamp-2">{a.title}</div>
              <div className="text-gray-600 text-sm mb-2 line-clamp-3">{extractPlainText(a.content, 100)}</div>
              <div className="flex gap-2 flex-wrap mt-auto">
                {a.category?.name && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">{a.category.name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
