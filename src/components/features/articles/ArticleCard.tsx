import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Article = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  category: {
    name: string;
  };
  imageUrl?: string; 
};

interface ArticleCardProps {
  article: Article;
}

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
  const div = document.createElement('div');
  div.innerHTML = content;
  const text = div.textContent || div.innerText || '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = new Date(article.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const contentSnippet = extractPlainText(article.content, 100);

  return (
    <Link href={`/articles/${article.id}`}>
    <Card className="h-full flex flex-col">
      <CardHeader>
          {/* Bagian yang dimodifikasi untuk menampilkan gambar */}
          <div className="relative aspect-video bg-muted rounded-md mb-4 overflow-hidden">
            <img
              src={article.imageUrl || `https://picsum.photos/seed/${article.id}/400/225`}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
          <CardTitle className="text-lg break-words">{article.title}</CardTitle>
        </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground break-words line-clamp-3 overflow-hidden max-h-16">{contentSnippet}</p>
      </CardContent>
      <CardFooter>
        <Badge variant="outline">{article.category.name}</Badge>
      </CardFooter>
    </Card>
    </Link>

  );
}