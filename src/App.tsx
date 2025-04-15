import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { SubmissionProvider } from "./context/SubmissionContext";
import AppShell from "./components/layout/AppShell";

import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import ArticlesPage from "./pages/articles/ArticlesPage";
import ArticleDetailPage from "./pages/articles/ArticleDetailPage";
import SubmissionsPage from "./pages/submissions/SubmissionsPage";
import SubmissionDetailPage from "./pages/submissions/SubmissionDetailPage";
import NewSubmissionPage from "./pages/submissions/NewSubmissionPage";
import ReviewsPage from "./pages/reviews/ReviewsPage";
import ReviewDetailsPage from "./pages/reviews/ReviewDetailsPage";
import UsersPage from "./pages/admin/UsersPage";
import NotFound from "./pages/NotFound";
import CopyeditorAssignmentPage from "./pages/submissions/CopyeditorAssignmentPage";
import PublisherAssignmentPage from "./pages/submissions/PublisherAssignmentPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubmissionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppShell>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                
                <Route path="/articles" element={<ArticlesPage />} />
                <Route path="/articles/:id" element={<ArticleDetailPage />} />
                
                <Route path="/submissions" element={<SubmissionsPage />} />
                <Route path="/submissions/new" element={<NewSubmissionPage />} />
                <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
                <Route path="/submissions/:id/copyeditors" element={<CopyeditorAssignmentPage />} />
                <Route path="/submissions/:id/publishers" element={<PublisherAssignmentPage />} />
                
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/reviews/:id" element={<ReviewDetailsPage />} />
                
                <Route path="/users" element={<UsersPage />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppShell>
          </BrowserRouter>
        </TooltipProvider>
      </SubmissionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
