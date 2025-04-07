
import { useState } from "react";
import { User } from "@/types";
import { usersApi } from "@/api/apiService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export function useProfileUpdate() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const updateProfile = async (updatedData: Partial<User>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, this would call an API endpoint
      await usersApi.updateUser(user.id, updatedData);

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      // Force page reload to reflect changes
      // In a real app, you would update the user context instead
      window.location.reload();
      
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateProfile, isLoading };
}
