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

export default function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = new Date(article.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const contentSnippet = article.content.substring(0, 100) + "...";

  return (
    <Link href={`/articles/${article.id}`}>
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="aspect-video bg-muted rounded-md mb-4">
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