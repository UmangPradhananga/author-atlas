import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  ClipboardCheck, 
  BookOpen, 
  Users, 
  Settings,
  ChevronRight,
  Plus,
  Edit,
  Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { buttonVariants } from '@/components/ui/button';

interface SidebarLinkProps {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  isActive: boolean;
}

const SidebarLink = ({ href, icon: Icon, title, isActive }: SidebarLinkProps) => {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(href)}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "w-full justify-start rounded-lg",
        isActive 
          ? "bg-accent text-accent-foreground font-medium" 
          : "hover:bg-accent hover:text-accent-foreground font-normal"
      )}
    >
      <Icon className="mr-2 h-5 w-5" />
      {title}
    </button>
  );
};

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role;
  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className={cn(
        "hidden md:flex flex-col border-r bg-background h-[calc(100vh-4rem)] overflow-y-auto",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      <div className="flex-1 p-4 space-y-2">
        {/* Dashboard - all users except readers */}
        {role !== 'Reader' && (
          <SidebarLink 
            href="/dashboard" 
            icon={LayoutDashboard} 
            title={isExpanded ? "Dashboard" : ""} 
            isActive={isActive('/dashboard')}
          />
        )}
        
        {/* Submissions - Authors */}
        {(role === 'Author' || role === 'Admin' || role === 'Editor') && (
          <div className="space-y-1">
            <SidebarLink 
              href="/submissions" 
              icon={FileText} 
              title={isExpanded ? "My Submissions" : ""} 
              isActive={isActive('/submissions')}
            />
            {role === 'Author' && (
              <button
                onClick={() => navigate('/submissions/new')}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-start gap-2 mt-1"
                )}
              >
                <Plus className="h-4 w-4" />
                {isExpanded ? "New Submission" : ""}
              </button>
            )}
          </div>
        )}
        
        {/* Reviews - Reviewers */}
        {(role === 'Reviewer' || role === 'Admin' || role === 'Editor') && (
          <SidebarLink 
            href="/reviews" 
            icon={ClipboardCheck} 
            title={isExpanded ? "Review Queue" : ""} 
            isActive={isActive('/reviews')}
          />
        )}
        
        {/* Articles - Everyone */}
        <SidebarLink 
          href="/articles" 
          icon={BookOpen} 
          title={isExpanded ? "Articles" : ""} 
          isActive={isActive('/articles')}
        />
        
        {/* Users - Admin only */}
        {role === 'Admin' && (
          <SidebarLink 
            href="/users" 
            icon={Users} 
            title={isExpanded ? "Users" : ""} 
            isActive={isActive('/users')}
          />
        )}
        
        {/* Settings - Admin and Editors */}
        {(role === 'Admin' || role === 'Editor') && (
          <SidebarLink 
            href="/settings" 
            icon={Settings} 
            title={isExpanded ? "Settings" : ""} 
            isActive={isActive('/settings')}
          />
        )}
        
        {/* Copy Editing - Copy Editors */}
        {(role === 'Copyeditor' || role === 'Admin' || role === 'Editor') && (
          <SidebarLink 
            href="/copy-editing" 
            icon={Edit} 
            title={isExpanded ? "Copy Editing" : ""} 
            isActive={isActive('/copy-editing')}
          />
        )}
        
        {/* Publishing - Publishers */}
        {(role === 'Publisher' || role === 'Admin' || role === 'Editor') && (
          <SidebarLink 
            href="/publishing" 
            icon={Printer} 
            title={isExpanded ? "Publishing" : ""} 
            isActive={isActive('/publishing')}
          />
        )}
      </div>
      
      {/* Toggle sidebar width */}
      <div className="p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-full justify-center"
          )}
        >
          <ChevronRight className={cn(
            "h-4 w-4 transition-transform",
            isExpanded ? "rotate-180" : ""
          )} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
