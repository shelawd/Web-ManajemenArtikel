import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Definisikan tipe data untuk satu artikel sesuai skema API
type Article = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  category: {
    name: string;
  };
  // API tidak menyediakan gambar, jadi kita gunakan placeholder
  imageUrl?: string; 
};

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  // Format tanggal agar lebih mudah dibaca
  const formattedDate = new Date(article.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Potong konten agar tidak terlalu panjang (misal, 100 karakter)
  const contentSnippet = article.content.substring(0, 100) + "...";

  return (
    <Link href={`/articles/${article.id}`}>
    <Card className="flex flex-col">
      <CardHeader>
        {/* Placeholder untuk gambar artikel */}
        <div className="aspect-video bg-muted rounded-md mb-4">
            {/* Jika ada article.imageUrl, tampilkan di sini */}
        </div>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
        <CardTitle className="text-lg">{article.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{contentSnippet}</p>
      </CardContent>
      <CardFooter>
        <Badge variant="outline">{article.category.name}</Badge>
      </CardFooter>
    </Card>
    </Link>

  );
}