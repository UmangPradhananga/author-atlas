
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { articlesApi } from "@/api/apiService";
import { Submission } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  FileText, 
  ChevronLeft, 
  Download, 
  Users, 
  Tag
} from "lucide-react";
import { format } from "date-fns";

const ArticleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticleDetails = async () => {
      try {
        if (!id) throw new Error("Article ID not provided");
        
        const articles = await articlesApi.getPublishedArticles();
        const foundArticle = articles.find(a => a.id === id);
        
        if (!foundArticle) {
          throw new Error("Article not found");
        }
        
        setArticle(foundArticle);
      } catch (err) {
        console.error("Error fetching article:", err);
        setError("Failed to load article details");
      } finally {
        setLoading(false);
      }
    };

    fetchArticleDetails();
  }, [id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p>Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Error</h2>
        <p className="text-destructive mb-6">{error || "Article not found"}</p>
        <Link to="/articles">
          <Button>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Articles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/articles" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back to Articles
        </Link>
        <h1 className="mb-4">{article.title}</h1>
        
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Published: {formatDate(article.publicationDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>
              {article.authors.length > 0 ? article.authors.join(', ') : 'Unknown Authors'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            <span>{article.category}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-3">Abstract</h2>
              <p className="whitespace-pre-wrap">{article.abstract}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-3">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Download Article</h3>
              <Button className="w-full" asChild>
                <a href={article.document} target="_blank" rel="noopener noreferrer">
                  <FileText className="mr-2 h-4 w-4" /> View Full PDF
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Article Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Category</dt>
                  <dd>{article.category}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Published Date</dt>
                  <dd>{formatDate(article.publicationDate)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Submission Date</dt>
                  <dd>{formatDate(article.submittedDate)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
