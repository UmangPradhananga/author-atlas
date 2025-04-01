
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="mb-6">My Profile</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl mb-1">{user.name}</CardTitle>
                <CardDescription className="text-base">
                  <span className="capitalize">{user.role}</span>
                  {user.affiliation && ` at ${user.affiliation}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
              <div>{user.email}</div>
            </div>

            {user.affiliation && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Affiliation</div>
                <div>{user.affiliation}</div>
              </div>
            )}

            {user.bio && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Biography</div>
                <div>{user.bio}</div>
              </div>
            )}

            <div className="pt-4">
              <Button variant="outline" className="mb-2 mr-2">
                Edit Profile
              </Button>
              <Button variant="outline" className="mb-2" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role & Permissions</CardTitle>
            <CardDescription>
              Your access level and capabilities in the Journal Management System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Role</span>
                <span className="capitalize">{user.role}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Dashboard Access</span>
                <span>{user.role !== 'reader' ? 'Yes' : 'No'}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Submission Management</span>
                <span>{user.role === 'author' || user.role === 'admin' || user.role === 'editor' ? 'Yes' : 'No'}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Review Capabilities</span>
                <span>{user.role === 'reviewer' || user.role === 'admin' || user.role === 'editor' ? 'Yes' : 'No'}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Editorial Decisions</span>
                <span>{user.role === 'editor' || user.role === 'admin' ? 'Yes' : 'No'}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="font-medium">System Administration</span>
                <span>{user.role === 'admin' ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
