
import { useState, useEffect } from "react";
import { articlesApi } from "@/api/apiService";
import { Submission } from "@/types";
import ArticleSearch from "@/components/articles/ArticleSearch";
import ArticleCard from "@/components/articles/ArticleCard";

const ArticlesPage = () => {
  const [articles, setArticles] = useState<Submission[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const publishedArticles = await articlesApi.getPublishedArticles();
        setArticles(publishedArticles);
        setFilteredArticles(publishedArticles);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError("Failed to load articles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredArticles(articles);
      return;
    }

    try {
      const results = await articlesApi.searchArticles(query);
      setFilteredArticles(results);
    } catch (err) {
      console.error("Error searching articles:", err);
      setError("Failed to search articles. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2">Published Articles</h1>
        <p className="text-muted-foreground">
          Browse and search through our collection of published academic articles.
        </p>
      </div>

      <div className="flex justify-center">
        <ArticleSearch onSearch={handleSearch} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p>Loading articles...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-destructive">{error}</p>
          <button
            className="mt-4 text-primary underline"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No Articles Found</h3>
          {searchQuery ? (
            <p className="text-muted-foreground">
              No results match your search query. Try different keywords or{" "}
              <button
                className="text-primary underline"
                onClick={() => handleSearch("")}
              >
                clear your search
              </button>
              .
            </p>
          ) : (
            <p className="text-muted-foreground">
              There are no published articles available at this time.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticlesPage;
