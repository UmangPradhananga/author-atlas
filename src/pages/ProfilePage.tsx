
import { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const { updateProfile, isLoading } = useProfileUpdate();

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

  const handleSaveProfile = async (updatedUser: typeof user) => {
    const success = await updateProfile(updatedUser);
    if (success) {
      setIsEditing(false);
    }
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
              {!isEditing && (
                <div>
                  <CardTitle className="text-2xl mb-1">{user.name}</CardTitle>
                  <CardDescription className="text-base">
                    <span className="capitalize">{user.role}</span>
                    {user.affiliation && ` at ${user.affiliation}`}
                  </CardDescription>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <ProfileEditForm 
                user={user}
                onSave={handleSaveProfile}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <>
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

                {user.role === 'reviewer' && user.reviewPreferences && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Peer Review Preferences</div>
                    <ul className="list-disc list-inside text-sm">
                      {user.reviewPreferences.acceptsOpenReview && (
                        <li>Open review</li>
                      )}
                      {user.reviewPreferences.acceptsSingleBlind && (
                        <li>Single-blind review</li>
                      )}
                      {user.reviewPreferences.acceptsDoubleBlind && (
                        <li>Double-blind review</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="pt-4">
                  <Button variant="outline" className="mb-2 mr-2" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="mb-2" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {!isEditing && (
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
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
