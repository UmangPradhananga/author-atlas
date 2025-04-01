
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, User } from "lucide-react";
import { Submission } from "@/types";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface ArticleCardProps {
  article: Submission;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {article.abstract}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {article.keywords.slice(0, 4).map((keyword, index) => (
            <span 
              key={index} 
              className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs"
            >
              {keyword}
            </span>
          ))}
          {article.keywords.length > 4 && (
            <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs">
              +{article.keywords.length - 4}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="truncate">
              {article.authors.length > 0 ? article.authors.join(', ') : 'Unknown Author'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Published: {formatDate(article.publicationDate)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center"
          asChild
        >
          <a href={article.document} target="_blank" rel="noopener noreferrer">
            <FileText className="h-4 w-4 mr-1" /> View PDF
          </a>
        </Button>
        <Button 
          size="sm"
          onClick={() => navigate(`/articles/${article.id}`)}
        >
          Read More
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ArticleCard;
